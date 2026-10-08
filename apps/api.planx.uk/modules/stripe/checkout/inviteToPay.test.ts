import { addDays, addHours, getUnixTime, subDays, subMinutes } from "date-fns";
import supertest from "supertest";

import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { getPaymentStatusInsert } from "../webhook/test/mocks.js";
import {
  buildPaymentRequest,
  mockCreate,
  mockCreatePaymentRequestCheckoutSessionDefaults,
  mockExpire,
  mockGetTeamBySlug,
  mockInitiatedCheckoutSessions,
  mockPaymentRequest,
  mockRetrieve,
  PAYEE_EMAIL,
  PAYMENT_REQUEST_ID,
  paymentRequestFeeBreakdown,
  STRIPE_ACCOUNT_ID,
  stripeTeam,
  validBody,
} from "./test/mocks.js";

vi.mock(
  "stripe",
  async () => (await import("./test/mocks.js")).mockStripeModule,
);
vi.mock(
  "../connect/service.js",
  async () => (await import("./test/mocks.js")).mockConnectServiceModule,
);

describe("creating a Stripe Checkout Session for an invite to pay request", () => {
  const ENDPOINT = `/stripe/payment-request/${PAYMENT_REQUEST_ID}/checkout-session`;
  const ITP_RETURN_URL = `https://www.example.com/southwark/apply/pay?paymentRequestId=${PAYMENT_REQUEST_ID}`;

  const expectedMetadata = {
    flow: "Apply for planning permission",
    source: "PlanX",
    paidViaInviteToPay: "true",
    propertyType: "house.semiDetached",
    sessionId: validBody.sessionId,
    origin: "https://api.example.com",
  };

  beforeEach(() => {
    mockCreatePaymentRequestCheckoutSessionDefaults();
  });

  it("returns the hosted Checkout Session URL", async () => {
    await supertest(app)
      .post(ENDPOINT)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          url: "https://checkout.stripe.com/c/pay/cs_test_a1b2c3",
        });
      });
  });

  it("creates a destination charge from the payment request", async () => {
    await supertest(app).post(ENDPOINT).expect(200);

    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "gbp",
              product_data: { name: "Application fee" },
              unit_amount: 9700,
            },
            quantity: 1,
          },
          {
            price_data: {
              currency: "gbp",
              product_data: { name: "PlanX service charge" },
              unit_amount: 4800,
            },
            quantity: 1,
          },
        ],
        success_url: `${ITP_RETURN_URL}&stripeSessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `${ITP_RETURN_URL}&cancelled=true`,
        customer_email: PAYEE_EMAIL,
        metadata: expectedMetadata,
        payment_intent_data: {
          on_behalf_of: STRIPE_ACCOUNT_ID,
          transfer_data: { destination: STRIPE_ACCOUNT_ID },
          application_fee_amount: 4800,
          metadata: expectedMetadata,
        },
      }),
    );
  });

  it("returns the payer to the team's custom domain", async () => {
    mockPaymentRequest(
      buildPaymentRequest(
        {},
        {
          flow: {
            slug: "apply",
            team: { slug: "southwark", domain: "planning.southwark.gov.uk" },
          },
        },
      ),
    );

    await supertest(app).post(ENDPOINT).expect(200);

    const { success_url } = mockCreate.mock.calls[0][0];
    expect(success_url).toBe(
      `https://planning.southwark.gov.uk/apply/pay?paymentRequestId=${PAYMENT_REQUEST_ID}&stripeSessionId={CHECKOUT_SESSION_ID}`,
    );
  });

  it("keeps the reserved keys and paidViaInviteToPay authoritative over the metadata config", async () => {
    mockPaymentRequest(
      buildPaymentRequest({
        stripeMetadata: [
          {
            key: "flow",
            value: "Apply for planning permission",
            type: "static",
          },
          { key: "source", value: "PlanX", type: "static" },
          { key: "sessionId", value: "spoofed", type: "static" },
          { key: "origin", value: "https://api.spoofed.com", type: "static" },
        ],
      }),
    );

    await supertest(app).post(ENDPOINT).expect(200);

    const { metadata } = mockCreate.mock.calls[0][0];
    expect(metadata).toEqual({
      flow: "Apply for planning permission",
      source: "PlanX",
      paidViaInviteToPay: "true",
      sessionId: validBody.sessionId,
      origin: "https://api.example.com",
    });
  });

  it("expires the Checkout Session after 24 hours (minus the buffer) when the request has longer left", async () => {
    const before = new Date();
    await supertest(app).post(ENDPOINT).expect(200);
    const after = new Date();

    const { expires_at } = mockCreate.mock.calls[0][0];
    expect(expires_at).toBeGreaterThanOrEqual(
      getUnixTime(subMinutes(addHours(before, 24), 5)),
    );
    expect(expires_at).toBeLessThanOrEqual(
      getUnixTime(subMinutes(addHours(after, 24), 5)),
    );
  });

  it("caps the Checkout Session expiry at the request's expiry", async () => {
    // Two hours left to pay
    const createdAt = addHours(subDays(new Date(), 28), 2);
    mockPaymentRequest(
      buildPaymentRequest({ createdAt: createdAt.toISOString() }),
    );

    await supertest(app).post(ENDPOINT).expect(200);

    const { expires_at } = mockCreate.mock.calls[0][0];
    expect(expires_at).toBe(getUnixTime(addDays(createdAt, 28)));
  });

  it("records an 'initiated' payment status against the Checkout Session", async () => {
    await supertest(app).post(ENDPOINT).expect(200);

    expect(getPaymentStatusInsert()?.variables).toEqual({
      sessionId: validBody.sessionId,
      flowId: validBody.flowId,
      teamSlug: "southwark",
      stripePaymentId: "cs_test_a1b2c3",
      stripeStatus: "initiated",
      amount: 14500,
      feeBreakdown: paymentRequestFeeBreakdown,
      metadata: expectedMetadata,
    });
  });

  it("expires the payer's previous Checkout Session", async () => {
    mockInitiatedCheckoutSessions(["cs_test_previous"]);
    mockRetrieve.mockResolvedValue({ id: "cs_test_previous", status: "open" });

    await supertest(app).post(ENDPOINT).expect(200);

    expect(mockExpire).toHaveBeenCalledWith("cs_test_previous");
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  describe("refusing a payment request which cannot be paid", () => {
    const expectNoCheckoutSession = () => {
      expect(mockCreate).not.toHaveBeenCalled();
      expect(getPaymentStatusInsert()).toBeUndefined();
    };

    it.each([
      {
        case: "it does not exist",
        paymentRequest: null,
        status: 404,
        error: /not found/,
      },
      {
        case: "it has already been paid",
        paymentRequest: buildPaymentRequest({
          paidAt: new Date().toISOString(),
        }),
        status: 409,
        error: /has already been paid/,
      },
      {
        case: "it has expired",
        paymentRequest: buildPaymentRequest({
          createdAt: subDays(new Date(), 29).toISOString(),
        }),
        status: 410,
        error: /has expired/,
      },
      {
        case: "it expires before a Checkout Session can",
        paymentRequest: buildPaymentRequest({
          createdAt: addHours(subDays(new Date(), 28), 0.25).toISOString(),
        }),
        status: 410,
        error: /has expired/,
      },
      {
        case: "its session has been deleted",
        paymentRequest: buildPaymentRequest(
          {},
          { deletedAt: new Date().toISOString() },
        ),
        status: 410,
        error: /has been deleted/,
      },
      {
        case: "its session no longer exists",
        paymentRequest: buildPaymentRequest({ session: null }),
        status: 410,
        error: /has been deleted/,
      },
      {
        case: "its session is not locked",
        paymentRequest: buildPaymentRequest({}, { lockedAt: null }),
        status: 409,
        error: /is not awaiting payment/,
      },
      {
        case: "a GOV.UK Pay payment has already been started",
        paymentRequest: buildPaymentRequest({
          govPayPaymentId: "govpay_123",
        }),
        status: 409,
        error: /must be paid via GOV.UK Pay/,
      },
    ])(
      "returns a $status when $case",
      async ({ paymentRequest, status, error }) => {
        mockPaymentRequest(paymentRequest);

        await supertest(app)
          .post(ENDPOINT)
          .expect(status)
          .then((res) => {
            expect(res.body.error).toMatch(error);
          });

        expectNoCheckoutSession();
      },
    );

    it("returns a 409 when the team is not on Stripe", async () => {
      mockGetTeamBySlug.mockResolvedValue({
        ...stripeTeam,
        settings: { paymentProvider: "govpay" },
      });

      await supertest(app).post(ENDPOINT).expect(409);

      expect(mockGetTeamBySlug).toHaveBeenCalledWith("southwark");
      expectNoCheckoutSession();
    });

    it("returns a 500 when the team lookup fails", async () => {
      mockGetTeamBySlug.mockRejectedValue(new Error("Hasura is unreachable"));

      await supertest(app).post(ENDPOINT).expect(500);

      expectNoCheckoutSession();
    });

    it("returns a 500 when the payment request lookup fails", async () => {
      queryMock.mockQuery({
        name: "GetPaymentRequestForCheckout",
        matchOnVariables: false,
        status: 500,
        data: {},
      });

      await supertest(app).post(ENDPOINT).expect(500);

      expectNoCheckoutSession();
    });

    it("returns a 400 for an invalid payment request id", async () => {
      await supertest(app)
        .post("/stripe/payment-request/not-a-uuid/checkout-session")
        .expect(400);

      expectNoCheckoutSession();
    });

    it("returns a 422 when the payment request has no fee breakdown", async () => {
      mockPaymentRequest(buildPaymentRequest({ feeBreakdown: null }));

      await supertest(app)
        .post(ENDPOINT)
        .expect(422)
        .then((res) => {
          expect(res.body.error).toMatch(
            /Failed to create Stripe Checkout Session for payment request/,
          );
        });

      expectNoCheckoutSession();
    });
  });

  it("returns a 500 when Stripe rejects the request", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Stripe is down"));

    await supertest(app).post(ENDPOINT).expect(500);

    expect(getPaymentStatusInsert()).toBeUndefined();
  });
});
