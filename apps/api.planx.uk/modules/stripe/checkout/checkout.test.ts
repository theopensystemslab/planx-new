import supertest from "supertest";

import app from "../../../server.js";
import { queryMock } from "../../../tests/graphqlQueryMock.js";

const {
  mockCreate,
  mockRetrieve,
  mockGetTeamBySlug,
  mockGetStripeAccountId,
  mockIsAccountReadyForPayments,
} = vi.hoisted(() => ({
  mockCreate: vi.fn(),
  mockRetrieve: vi.fn(),
  mockGetTeamBySlug: vi.fn(),
  mockGetStripeAccountId: vi.fn(),
  mockIsAccountReadyForPayments: vi.fn(),
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
  isAccountReadyForPayments: (...args: unknown[]) =>
    mockIsAccountReadyForPayments(...args),
}));

const STRIPE_ACCOUNT_ID = "acct_test_southwark";

const stripeTeam = {
  id: 1,
  slug: "southwark",
  settings: { paymentProvider: "stripe" },
};

const defaultMetadata = {
  flow: "Apply for planning permission",
  source: "PlanX",
  paidViaInviteToPay: "false",
};

const validBody = {
  sessionId: "f2d8ca1d-a43b-43ec-b3d9-a9fec63ff19c",
  flowId: "7cd1c4b4-4229-424f-8d04-c9fdc958ef4e",
  amount: 14500,
  returnTo: "published",
  metadata: defaultMetadata,
};

const RETURN_URL = "https://www.example.com/southwark/apply/published";

const mockReturnURLContext = ({
  flow = { slug: "apply", team: { slug: "southwark", domain: null } },
  session = { flowId: validBody.flowId, email: null },
}: {
  flow?: {
    slug: string;
    team: { slug: string; domain: string | null };
  } | null;
  session?: { flowId: string; email: string | null } | null;
} = {}) =>
  queryMock.mockQuery({
    name: "GetCheckoutReturnURLContext",
    matchOnVariables: false,
    data: { flow, session },
  });

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
  "application.fee.serviceCharge": 40,
  "application.fee.serviceCharge.VAT": 8,
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
    mockIsAccountReadyForPayments.mockReset().mockResolvedValue(true);
    mockPassportLookup(feeBreakdownPassport);
    mockReturnURLContext();
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
          flowId: validBody.flowId,
          teamSlug: "southwark",
          origin: "https://api.example.com",
        },
        payment_intent_data: {
          on_behalf_of: STRIPE_ACCOUNT_ID,
          transfer_data: { destination: STRIPE_ACCOUNT_ID },
          application_fee_amount: 4800,
          metadata: {
            ...defaultMetadata,
            sessionId: validBody.sessionId,
            flowId: validBody.flowId,
            teamSlug: "southwark",
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
      flowId: validBody.flowId,
      teamSlug: "southwark",
      origin: "https://api.example.com",
    };
    expect(metadata).toEqual(expected);
    expect(payment_intent_data.metadata).toEqual(expected);
  });

  it("keeps the internal keys authoritative over client metadata", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({
        ...validBody,
        // A colliding `sessionId` must not override the key the webhook relies on
        // TODO: Maybe we should ban these keys from the frontend (and Zod schema) once list is finalised?
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
      flowId: validBody.flowId,
      teamSlug: "southwark",
      origin: "https://api.example.com",
    });
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

  it("rejects a team not switched over to Stripe with a 409", async () => {
    mockGetTeamBySlug.mockResolvedValue({
      ...stripeTeam,
      settings: { paymentProvider: "govpay" },
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(409);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects a team without a connected Stripe account with a 409", async () => {
    mockGetStripeAccountId.mockResolvedValue(null);

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(409);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("checks the connected account before creating the session", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    expect(mockIsAccountReadyForPayments).toHaveBeenCalledWith(
      STRIPE_ACCOUNT_ID,
    );
  });

  it("rejects a team whose Stripe account is not connected to the platform, or cannot take payments, with a 409", async () => {
    mockIsAccountReadyForPayments.mockResolvedValue(false);

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(409);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("surfaces an error when the connected account check fails", async () => {
    mockIsAccountReadyForPayments.mockRejectedValue(
      new Error("Stripe is down"),
    );

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(500);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it.each([
    ["preview", "https://www.example.com/southwark/apply/preview"],
    ["draft", "https://www.example.com/southwark/apply/draft"],
  ])("returns to the %s route", async (returnTo, expectedURL) => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({ ...validBody, returnTo })
      .expect(200);

    const { success_url, cancel_url } = mockCreate.mock.calls[0][0];
    expect(success_url).toBe(
      `${expectedURL}?stripeSessionId={CHECKOUT_SESSION_ID}`,
    );
    expect(cancel_url).toBe(`${expectedURL}?cancelled=true`);
  });

  it("returns published services to the team's custom domain", async () => {
    mockReturnURLContext({
      flow: {
        slug: "apply",
        team: {
          slug: "southwark",
          domain: "planningservices.southwark.gov.uk",
        },
      },
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    const { success_url } = mockCreate.mock.calls[0][0];
    expect(success_url).toBe(
      "https://planningservices.southwark.gov.uk/apply?stripeSessionId={CHECKOUT_SESSION_ID}",
    );
  });

  it("returns preview and draft to the PlanX domain, even for a team with a custom domain", async () => {
    mockReturnURLContext({
      flow: {
        slug: "apply",
        team: {
          slug: "southwark",
          domain: "planningservices.southwark.gov.uk",
        },
      },
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({ ...validBody, returnTo: "draft" })
      .expect(200);

    const { success_url } = mockCreate.mock.calls[0][0];
    expect(success_url).toBe(
      "https://www.example.com/southwark/apply/draft?stripeSessionId={CHECKOUT_SESSION_ID}",
    );
  });

  it("carries sessionId and email for Save & Return sessions, so the applicant can resume", async () => {
    mockReturnURLContext({
      session: { flowId: validBody.flowId, email: "applicant@example.com" },
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    const { success_url, cancel_url } = mockCreate.mock.calls[0][0];
    const resumeParams = `sessionId=${validBody.sessionId}&email=applicant%40example.com`;
    expect(success_url).toBe(
      `${RETURN_URL}?${resumeParams}&stripeSessionId={CHECKOUT_SESSION_ID}`,
    );
    expect(cancel_url).toBe(`${RETURN_URL}?${resumeParams}&cancelled=true`);
  });

  it("omits resume params when the session hasn't been saved (/draft links)", async () => {
    mockReturnURLContext({ session: null });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    const { success_url } = mockCreate.mock.calls[0][0];
    expect(success_url).toBe(
      `${RETURN_URL}?stripeSessionId={CHECKOUT_SESSION_ID}`,
    );
  });

  it("rejects a client-supplied returnURL", async () => {
    const { returnTo: _returnTo, ...bodyWithoutReturnTo } = validBody;

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({
        ...bodyWithoutReturnTo,
        returnURL: "https://evil.example.org/phishing",
      })
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects an unknown returnTo with a 400", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send({ ...validBody, returnTo: "https://evil.example.org" })
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects a flow which doesn't exist with a 400", async () => {
    mockReturnURLContext({ flow: null });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects another team's flow with a 400", async () => {
    mockReturnURLContext({
      flow: { slug: "apply", team: { slug: "lambeth", domain: null } },
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects a session from a different flow with a 400", async () => {
    mockReturnURLContext({
      session: {
        flowId: "00000000-0000-4000-8000-000000000000",
        email: "applicant@example.com",
      },
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(400);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("surfaces an error when the return URL lookup fails", async () => {
    queryMock.mockQuery({
      name: "GetCheckoutReturnURLContext",
      matchOnVariables: false,
      status: 500,
      data: {},
    });

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(500);

    expect(mockCreate).not.toHaveBeenCalled();
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
