import supertest from "supertest";

import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";

const { mockCreate, mockRetrieve, mockGetTeamBySlug, mockGetStripeAccountId } =
  vi.hoisted(() => ({
    mockCreate: vi.fn(),
    mockRetrieve: vi.fn(),
    mockGetTeamBySlug: vi.fn(),
    mockGetStripeAccountId: vi.fn(),
  }));

vi.mock("stripe", () => ({
  default: class MockStripe {
    checkout = {
      sessions: { create: mockCreate, retrieve: mockRetrieve },
    };
  },
}));

vi.mock("../connect/service.js", () => ({
  getTeamBySlug: (...args: unknown[]) => mockGetTeamBySlug(...args),
  getStripeAccountId: (...args: unknown[]) => mockGetStripeAccountId(...args),
}));

const STRIPE_ACCOUNT_ID = "acct_test_southwark";

const stripeTeam = {
  id: 1,
  slug: "southwark",
  settings: { paymentProvider: "stripe" },
};

const validBody = {
  sessionId: "f2d8ca1d-a43b-43ec-b3d9-a9fec63ff19c",
  flowId: "7cd1c4b4-4229-424f-8d04-c9fdc958ef4e",
  amount: 14500,
  returnURL: "https://editor.planx.uk/team/flow/published",
};

// A £145 total made up of a £121 application fee + £24 (incl. VAT) service charge
const mockPassportLookup = (passportData: unknown = null) =>
  queryMock.mockQuery({
    name: "GetCheckoutSessionPassportData",
    matchOnVariables: false,
    data: { session: { passportData } },
  });

const feeBreakdownPassport = {
  "application.fee.calculated": 121,
  "application.fee.payable": 145,
  "application.fee.serviceCharge": 20,
  "application.fee.serviceCharge.VAT": 4,
};

describe("creating a Stripe Checkout Session", () => {
  beforeEach(() => {
    mockCreate.mockReset();
    mockCreate.mockResolvedValue({
      id: "cs_test_a1b2c3",
      url: "https://checkout.stripe.com/c/pay/cs_test_a1b2c3",
    });
    mockGetTeamBySlug.mockReset().mockResolvedValue(stripeTeam);
    mockGetStripeAccountId.mockReset().mockResolvedValue(STRIPE_ACCOUNT_ID);
    mockPassportLookup(feeBreakdownPassport);
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
              unit_amount: 12100,
            },
            quantity: 1,
          },
          {
            price_data: {
              currency: "gbp",
              product_data: { name: "Service charge" },
              unit_amount: 2400,
            },
            quantity: 1,
          },
        ],
        success_url:
          "https://editor.planx.uk/team/flow/published?stripeSessionId={CHECKOUT_SESSION_ID}",
        cancel_url:
          "https://editor.planx.uk/team/flow/published?cancelled=true",
        metadata: {
          sessionId: validBody.sessionId,
          flowId: validBody.flowId,
        },
        payment_intent_data: {
          on_behalf_of: STRIPE_ACCOUNT_ID,
          transfer_data: { destination: STRIPE_ACCOUNT_ID },
          application_fee_amount: 2400,
          metadata: {
            sessionId: validBody.sessionId,
            flowId: validBody.flowId,
            teamSlug: "southwark",
          },
        },
      }),
    );
  });

  it("retains the service charge (incl. VAT) as the Stripe application fee", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    const { payment_intent_data } = mockCreate.mock.calls[0][0];
    expect(payment_intent_data.application_fee_amount).toBe(2400);
  });

  it("omits the application fee when there is no fee breakdown to split", async () => {
    mockPassportLookup(null);

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    const { payment_intent_data } = mockCreate.mock.calls[0][0];
    expect(payment_intent_data.application_fee_amount).toBeUndefined();
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
      "application.fee.serviceCharge": 25,
      "application.fee.serviceCharge.VAT": 5,
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
      ["Application fee", 11100],
      ["Fast Track fee", 2400],
      ["Service charge", 3000],
    ]);

    const total = line_items.reduce(
      (sum: number, item: { price_data: { unit_amount: number } }) =>
        sum + item.price_data.unit_amount,
      0,
    );
    expect(total).toBe(16500);
  });

  it("falls back to a single line for the client amount when no fee breakdown is found", async () => {
    mockPassportLookup(null);

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    const { line_items } = mockCreate.mock.calls[0][0];
    expect(line_items).toEqual([
      {
        price_data: {
          currency: "gbp",
          product_data: { name: "Planning application fee" },
          unit_amount: 14500,
        },
        quantity: 1,
      },
    ]);
  });

  it("falls back to a single line when the fee breakdown lookup fails", async () => {
    queryMock.mockQuery({
      name: "GetCheckoutSessionPassportData",
      matchOnVariables: false,
      status: 500,
      data: {},
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    const { line_items } = mockCreate.mock.calls[0][0];
    expect(line_items).toEqual([
      {
        price_data: {
          currency: "gbp",
          product_data: { name: "Planning application fee" },
          unit_amount: 14500,
        },
        quantity: 1,
      },
    ]);
  });

  it("surfaces an error when the team lookup fails", async () => {
    mockGetTeamBySlug.mockRejectedValue(new Error("Hasura is unreachable"));

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(500);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects a team not switched over to Stripe with a 400", async () => {
    mockGetTeamBySlug.mockResolvedValue({
      ...stripeTeam,
      settings: { paymentProvider: "govpay" },
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects a team without a connected Stripe account with a 400", async () => {
    mockGetStripeAccountId.mockResolvedValue(null);

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("appends params with & when the returnURL already has a query string", async () => {
    const returnURL = "https://editor.planx.uk/team/flow/published?foo=bar";

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({ ...validBody, returnURL })
      .expect(200);

    const { success_url, cancel_url } = mockCreate.mock.calls[0][0];

    expect(success_url).toBe(
      "https://editor.planx.uk/team/flow/published?foo=bar&stripeSessionId={CHECKOUT_SESSION_ID}",
    );
    expect(cancel_url).toBe(
      "https://editor.planx.uk/team/flow/published?foo=bar&cancelled=true",
    );
  });

  it("rejects an invalid request body with a 400", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({ ...validBody, amount: -1, sessionId: "not-a-uuid" })
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("returns a 500 when Stripe rejects the request", async () => {
    mockCreate.mockRejectedValueOnce(new Error("Stripe is down"));

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(500);
  });
});

describe("retrieving a Stripe Checkout Session status", () => {
  beforeEach(() => {
    mockRetrieve.mockReset();
  });

  it("returns the status, payment status and PaymentIntent id", async () => {
    mockRetrieve.mockResolvedValue({
      id: "cs_test_a1b2c3",
      status: "complete",
      payment_status: "paid",
      payment_intent: "pi_test_a1b2c3",
    });

    await supertest(app)
      .get(`/stripe/checkout-session/southwark/cs_test_a1b2c3`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          status: "complete",
          paymentStatus: "paid",
          paymentIntentId: "pi_test_a1b2c3",
        });
      });

    expect(mockRetrieve).toHaveBeenCalledWith("cs_test_a1b2c3");
  });

  it("handles in-flight sessions with no PaymentIntent yet", async () => {
    mockRetrieve.mockResolvedValue({
      id: "cs_test_unpaid",
      status: "complete",
      payment_status: "unpaid",
      payment_intent: null,
    });

    await supertest(app)
      .get(`/stripe/checkout-session/southwark/cs_test_unpaid`)
      .expect(200)
      .then((res) => {
        expect(res.body).toEqual({
          status: "complete",
          paymentStatus: "unpaid",
          paymentIntentId: null,
        });
      });
  });

  it("returns a 500 when Stripe rejects the request", async () => {
    mockRetrieve.mockRejectedValueOnce(new Error("No such checkout session"));

    await supertest(app)
      .get(`/stripe/checkout-session/southwark/cs_missing`)
      .expect(500);
  });
});
