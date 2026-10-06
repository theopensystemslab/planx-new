import supertest from "supertest";

import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";
import { getPaymentStatusInsert } from "../webhook/test/mocks.js";
import {
  defaultMetadata,
  mockCreate,
  mockCreateCheckoutSessionDefaults,
  mockPassportLookup,
  mockReturnURLContext,
  RETURN_URL,
  STRIPE_ACCOUNT_ID,
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

describe("creating a Stripe Checkout Session", () => {
  beforeEach(() => {
    mockCreateCheckoutSessionDefaults();
  });

  it("returns the hosted Checkout Session URL", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          url: "https://checkout.stripe.com/c/pay/cs_test_a1b2c3",
        });
      });
  });

  it("creates the session with the expected payload", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

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
        success_url: `${RETURN_URL}?stripeSessionId={CHECKOUT_SESSION_ID}`,
        cancel_url: `${RETURN_URL}?cancelled=true`,
        metadata: {
          ...defaultMetadata,
          sessionId: validBody.sessionId,
          origin: "https://api.example.com",
        },
        payment_intent_data: {
          on_behalf_of: STRIPE_ACCOUNT_ID,
          transfer_data: { destination: STRIPE_ACCOUNT_ID },
          application_fee_amount: 4800,
          metadata: {
            ...defaultMetadata,
            sessionId: validBody.sessionId,
            origin: "https://api.example.com",
          },
        },
      }),
    );
  });

  it("passes the default keys plus editor-configured extras into both the Checkout Session and PaymentIntent", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({
        ...validBody,
        metadata: { ...defaultMetadata, costCentre: "ABC123" },
      })
      .expect(200);

    const { metadata, payment_intent_data } = mockCreate.mock.calls[0][0];
    const expected = {
      ...defaultMetadata,
      costCentre: "ABC123",
      sessionId: validBody.sessionId,
      origin: "https://api.example.com",
    };
    expect(metadata).toEqual(expected);
    expect(payment_intent_data.metadata).toEqual(expected);
  });

  it("keeps the reserved keys authoritative over client metadata", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({
        ...validBody,
        // The editor blocks these keys, but they must never override the keys the webhook relies on
        metadata: {
          ...defaultMetadata,
          sessionId: "spoofed",
          origin: "https://api.spoofed.com",
        },
      })
      .expect(200);

    const { metadata } = mockCreate.mock.calls[0][0];
    expect(metadata).toEqual({
      ...defaultMetadata,
      sessionId: validBody.sessionId,
      origin: "https://api.example.com",
    });
  });

  it("rejects a session locked for invite to pay", async () => {
    mockReturnURLContext({
      session: {
        flowId: validBody.flowId,
        email: "applicant@example.com",
        lockedAt: "2026-10-06T12:00:00.000Z",
      },
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(409)
      .then((res) => {
        expect(res.body.error).toMatch(
          /Cannot initialise a new payment for locked session/,
        );
      });

    expect(mockCreate).not.toHaveBeenCalled();
    expect(getPaymentStatusInsert()).toBeUndefined();
  });

  it("rejects non-string metadata values", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({
        ...validBody,
        metadata: { ...defaultMetadata, count: 3 },
      })
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects an empty metadata object", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({ ...validBody, metadata: {} })
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects a source other than the fixed PlanX default", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({
        ...validBody,
        metadata: { ...defaultMetadata, source: "SomewhereElse" },
      })
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects metadata missing a required default key", async () => {
    const { paidViaInviteToPay: _omit, ...incompleteMetadata } =
      defaultMetadata;

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({ ...validBody, metadata: incompleteMetadata })
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects a request with no metadata", async () => {
    const { metadata: _metadata, ...bodyWithoutMetadata } = validBody;

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(bodyWithoutMetadata)
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("retains the service charge (incl. VAT) as the Stripe application fee", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    const { payment_intent_data } = mockCreate.mock.calls[0][0];
    expect(payment_intent_data.application_fee_amount).toBe(4800);
  });

  it("omits the application fee for an exempt service charge, even with a breakdown", async () => {
    mockPassportLookup({
      "application.fee.calculated": 145,
      "application.fee.payable": 145,
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    const { payment_intent_data } = mockCreate.mock.calls[0][0];
    expect(payment_intent_data.application_fee_amount).toBeUndefined();
  });

  it("itemises every fee component from the breakdown, summing to the payable total", async () => {
    mockPassportLookup({
      "application.fee.calculated": 100,
      "application.fee.payable": 165,
      "application.fee.payable.VAT": 11,
      "application.fee.serviceCharge": 40,
      "application.fee.serviceCharge.VAT": 8,
      "application.fee.fastTrack": 20,
      "application.fee.fastTrack.VAT": 4,
      "application.fee.paymentProcessing": 5,
      "application.fee.paymentProcessing.VAT": 1,
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    const { line_items } = mockCreate.mock.calls[0][0];
    expect(
      line_items.map(
        (item: {
          price_data: { product_data: { name: string }; unit_amount: number };
        }) => [item.price_data.product_data.name, item.price_data.unit_amount],
      ),
    ).toEqual([
      ["Application fee", 9300],
      ["Fast Track fee", 2400],
      ["PlanX service charge", 4800],
    ]);

    const total = line_items.reduce(
      (sum: number, item: { price_data: { unit_amount: number } }) =>
        sum + item.price_data.unit_amount,
      0,
    );
    expect(total).toBe(16500);
  });

  describe("failing without a fee breakdown", () => {
    it.each([
      { case: "the session has no passport data", passportData: null },
      {
        case: "the passport has no payable fee",
        passportData: { "application.fee.calculated": 100 },
      },
      {
        case: "the passport fee is invalid",
        passportData: { "application.fee.payable": -1 },
      },
    ])(
      "returns a 422 and creates no Checkout Session when $case",
      async ({ passportData }) => {
        mockPassportLookup(passportData);

        await supertest(app)
          .post("/stripe/checkout-session/southwark")
          .send(validBody)
          .expect(422)
          .then((res) => {
            expect(res.body.error).toMatch(
              /Failed to create Stripe Checkout Session for southwark/,
            );
          });

        expect(mockCreate).not.toHaveBeenCalled();
        expect(getPaymentStatusInsert()).toBeUndefined();
      },
    );

    it("returns a 500 and creates no Checkout Session when the fee breakdown lookup fails", async () => {
      queryMock.mockQuery({
        name: "GetCheckoutSessionPassportData",
        matchOnVariables: false,
        status: 500,
        data: {},
      });

      await supertest(app)
        .post("/stripe/checkout-session/southwark")
        .send(validBody)
        .expect(500);

      expect(mockCreate).not.toHaveBeenCalled();
      expect(getPaymentStatusInsert()).toBeUndefined();
    });
  });

  it("rejects an invalid request body with a 400", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({ ...validBody, sessionId: "not-a-uuid" })
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns a 500 when Stripe rejects the request", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Stripe is down"));

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(500);

    expect(getPaymentStatusInsert()).toBeUndefined();
  });
});
