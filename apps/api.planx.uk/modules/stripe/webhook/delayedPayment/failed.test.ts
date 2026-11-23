import type Stripe from "stripe";
import supertest from "supertest";

import type * as resend from "../../../../lib/resend/index.js";
import { sendEmail } from "../../../../lib/resend/index.js";
import app from "../../../../server.js";
import { queryMock } from "../../../../tests/graphqlQueryMock.js";
import * as payHelpers from "../../../pay/helpers.js";
import { rescheduleSessionEmailEvents } from "../../../webhooks/service/lowcalSessionEvents/index.js";
import {
  buildPaymentRequest,
  mockPaymentRequest,
  PAYMENT_REQUEST_ID,
} from "../../checkout/test/mocks.js";
import { STRIPE_WEBHOOK_ENDPOINT } from "../../routes.js";
import { sign } from "../test/utils.js";

vi.mock("../../../../lib/resend/index.js", async (importOriginal) => ({
  ...(await importOriginal<typeof resend>()),
  sendEmail: vi.fn(),
}));

vi.mock("../../../webhooks/service/lowcalSessionEvents/index.js", () => ({
  rescheduleSessionEmailEvents: vi.fn(),
}));

const SESSION_ID = "f2d8ca1d-a43b-43ec-b3d9-a9fec63ff19c";
const PAYER_EMAIL = "payer@example.com";
const APPLICANT_EMAIL = "applicant@example.com";
const DELAYED_PAYMENT_STARTED_AT = "2026-10-20T12:00:00Z";

const checkoutSession = (overrides: Partial<Stripe.Checkout.Session> = {}) => ({
  id: "cs_test_bacs",
  object: "checkout.session",
  status: "complete",
  payment_status: "unpaid",
  payment_intent: "pi_test_bacs",
  amount_total: 14500,
  customer_details: { email: PAYER_EMAIL },
  metadata: { sessionId: SESSION_ID, origin: process.env.API_URL_EXT },
  ...overrides,
});

const failedEvent = (overrides: Partial<Stripe.Checkout.Session> = {}) =>
  sign({
    id: "evt_async_payment_failed",
    type: "checkout.session.async_payment_failed",
    data: { object: checkoutSession(overrides) },
  });

const post = ({ payload, signature }: ReturnType<typeof sign>) =>
  supertest(app)
    .post(STRIPE_WEBHOOK_ENDPOINT)
    .set("Content-Type", "application/json")
    .set("stripe-signature", signature)
    .send(payload);

const mockSession = (overrides: Record<string, unknown> = {}) =>
  queryMock.mockQuery({
    name: "GetFailedPaymentSession",
    matchOnVariables: false,
    data: {
      session: {
        email: APPLICANT_EMAIL,
        createdAt: "2026-10-01T12:00:00Z",
        hasUserSaved: true,
        delayedPaymentStartedAt: DELAYED_PAYMENT_STARTED_AT,
        submittedAt: null,
        deletedAt: null,
        passportData: { _address: { title: "1 High Street, London" } },
        flow: {
          slug: "apply",
          name: "Apply for a lawful development certificate",
          team: { name: "Southwark", slug: "southwark", domain: null },
        },
        ...overrides,
      },
    },
  });

const mockCouncilEmailDetails = () =>
  queryMock.mockQuery({
    name: "GetCouncilEmailDetails",
    matchOnVariables: false,
    data: {
      teams: [
        {
          teamSettings: { helpEmail: "help@southwark.gov.uk" },
          invoiceDetails: { emailAddress: "finance@southwark.gov.uk" },
          theme: {
            logo: "https://example.com/logo.png",
            primaryColour: "#000",
          },
        },
      ],
    },
  });

const mockUnlock = () =>
  queryMock.mockQuery({
    name: "UnlockSessionAfterFailedPayment",
    matchOnVariables: false,
    data: { update_lowcal_sessions: { affected_rows: 1 } },
  });

const unlockCalls = () =>
  queryMock
    .getCalls()
    .filter((call) => call.id === "UnlockSessionAfterFailedPayment");

const sentEmail = () =>
  vi
    .mocked(sendEmail)
    .mock.calls.find(([template]) => template === "payment-failed-payer");

describe("a delayed payment (e.g. Bacs) failing", () => {
  beforeEach(() => {
    queryMock.reset();
    mockSession();
    mockCouncilEmailDetails();
    mockUnlock();
    vi.spyOn(payHelpers, "reportError");
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.restoreAllMocks();
  });

  describe("self-pay", () => {
    it("unlocks the session, so the applicant can resume it and pay again", async () => {
      await post(failedEvent()).expect(200);

      expect(unlockCalls()).toHaveLength(1);
      expect(unlockCalls()[0].variables).toEqual({ sessionId: SESSION_ID });
    });

    it("emails the payer a link to resume and pay again, before the end of the 28-day window", async () => {
      await post(failedEvent()).expect(200);

      expect(sendEmail).toHaveBeenCalledWith(
        "payment-failed-payer",
        PAYER_EMAIL,
        {
          serviceName: "Apply for a lawful development certificate",
          councilName: "Southwark",
          sessionId: SESSION_ID,
          address: "1 High Street, London",
          paymentReference: "pi_test_bacs",
          amount: "£145.00",
          councilLogo: "https://example.com/logo.png",
          councilPrimaryColour: "#000",
          payLink: `https://www.example.com/southwark/apply/published?sessionId=${SESSION_ID}`,
          // 28 days from the first delayed payment, not from when the session was created
          payByDate: "17 November 2026",
        },
        {
          idempotencyKey: "payment-failed-payer-pi_test_bacs",
          from: "Southwark <noreply@notifications.localplanning.services>",
          replyTo: "help@southwark.gov.uk",
        },
      );
    });

    it("moves the save & return reminder and expiry emails to the end of the window to pay", async () => {
      await post(failedEvent()).expect(200);

      expect(rescheduleSessionEmailEvents).toHaveBeenCalledWith({
        from: new Date(DELAYED_PAYMENT_STARTED_AT),
        payload: { sessionId: SESSION_ID, email: APPLICANT_EMAIL },
      });
    });

    it("doesn't schedule reminder or expiry emails for a session the applicant never saved", async () => {
      mockSession({ hasUserSaved: false });

      await post(failedEvent()).expect(200);

      expect(rescheduleSessionEmailEvents).not.toHaveBeenCalled();
      expect(sentEmail()).toBeDefined();
    });
  });

  describe("invite to pay", () => {
    const metadata = {
      sessionId: SESSION_ID,
      origin: process.env.API_URL_EXT!,
      paymentRequestId: PAYMENT_REQUEST_ID,
    };

    beforeEach(() => {
      mockPaymentRequest(
        buildPaymentRequest({ createdAt: "2026-10-10T12:00:00Z" }),
      );
    });

    it("keeps the session locked, and emails the payer a link back to the payment request until it expires", async () => {
      await post(failedEvent({ metadata })).expect(200);

      expect(unlockCalls()).toHaveLength(0);
      expect(rescheduleSessionEmailEvents).not.toHaveBeenCalled();
      expect(sentEmail()?.[2]).toEqual(
        expect.objectContaining({
          payLink: `https://www.example.com/southwark/apply/pay?paymentRequestId=${PAYMENT_REQUEST_ID}`,
          payByDate: "7 November 2026",
        }),
      );
    });

    it("does nothing when the payment request no longer exists", async () => {
      mockPaymentRequest(null);

      await post(failedEvent({ metadata })).expect(200);

      expect(sendEmail).not.toHaveBeenCalled();
    });
  });

  it.each([
    ["expired", { deletedAt: "2026-11-11T09:00:00Z" }],
    ["already submitted", { submittedAt: "2026-11-11T09:00:00Z" }],
  ])(
    "does nothing when the session is %s, as it can't be paid again",
    async (_, overrides) => {
      mockSession(overrides);

      await post(failedEvent()).expect(200);

      expect(unlockCalls()).toHaveLength(0);
      expect(sendEmail).not.toHaveBeenCalled();
    },
  );

  it("does nothing for a Checkout Session created by another environment", async () => {
    await post(
      failedEvent({
        metadata: { sessionId: SESSION_ID, origin: "https://api.other.env" },
      }),
    ).expect(200);

    expect(
      queryMock
        .getCalls()
        .filter((call) => call.id === "GetFailedPaymentSession"),
    ).toHaveLength(0);
  });

  it("does nothing when the session isn't in this environment", async () => {
    queryMock.mockQuery({
      name: "GetFailedPaymentSession",
      matchOnVariables: false,
      data: { session: null },
    });

    await post(failedEvent()).expect(200);

    expect(unlockCalls()).toHaveLength(0);
    expect(sendEmail).not.toHaveBeenCalled();
  });

  it("still unlocks the session, and reports an error, when the payer has no email address", async () => {
    await post(failedEvent({ customer_details: null })).expect(200);

    expect(unlockCalls()).toHaveLength(1);
    expect(sendEmail).not.toHaveBeenCalled();
    expect(payHelpers.reportError).toHaveBeenCalledWith(
      expect.objectContaining({
        error: expect.stringContaining("no payer email"),
      }),
    );
  });

  it("returns 500 when the email fails to send, so Stripe redelivers the event", async () => {
    vi.mocked(sendEmail).mockRejectedValueOnce(new Error("Resend is down"));

    await post(failedEvent()).expect(500);
  });
});
