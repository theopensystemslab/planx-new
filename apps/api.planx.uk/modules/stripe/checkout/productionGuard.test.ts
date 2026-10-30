import supertest from "supertest";

import app from "../../../server.js";
import {
  buildPaymentRequest,
  mockCreate,
  mockCreateCheckoutSessionDefaults,
  mockCreatePaymentRequestCheckoutSessionDefaults,
  mockExpire,
  mockGetTeamBySlug,
  mockPaymentRequest,
  mockReturnURLContext,
  PAYMENT_REQUEST_ID,
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

const SELF_PAY_ENDPOINT = "/stripe/checkout-session/southwark";
const INVITE_TO_PAY_ENDPOINT = `/stripe/payment-request/${PAYMENT_REQUEST_ID}/checkout-session`;

afterEach(() => {
  vi.unstubAllEnvs();
});

describe("creating Checkout Sessions in production, before Stripe payments go live", () => {
  beforeEach(() => {
    vi.stubEnv("APP_ENVIRONMENT", "production");
  });

  it("refuses a self-pay Checkout Session with a 409, without calling Stripe", async () => {
    mockCreateCheckoutSessionDefaults();

    await supertest(app)
      .post(SELF_PAY_ENDPOINT)
      .send(validBody)
      .expect(409)
      .then((res) => {
        expect(res.body.error).toBe("Stripe payments are not yet enabled");
      });

    expect(mockGetTeamBySlug).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("refuses an invite to pay Checkout Session with a 409, without calling Stripe", async () => {
    mockCreatePaymentRequestCheckoutSessionDefaults();

    await supertest(app)
      .post(INVITE_TO_PAY_ENDPOINT)
      .expect(409)
      .then((res) => {
        expect(res.body.error).toBe("Stripe payments are not yet enabled");
      });

    expect(mockGetTeamBySlug).not.toHaveBeenCalled();
    expect(mockExpire).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe("creating Checkout Sessions in production for an internal team", () => {
  const internalTeam = {
    slug: "apply",
    team: { slug: "opensystemslab", domain: null },
  };

  beforeEach(() => {
    vi.stubEnv("APP_ENVIRONMENT", "production");
  });

  it("creates a self-pay Checkout Session", async () => {
    mockCreateCheckoutSessionDefaults();
    mockGetTeamBySlug.mockResolvedValue({
      ...stripeTeam,
      slug: "opensystemslab",
    });
    mockReturnURLContext({ flow: internalTeam });

    await supertest(app)
      .post("/stripe/checkout-session/opensystemslab")
      .send(validBody)
      .expect(200);

    expect(mockGetTeamBySlug).toHaveBeenCalledWith("opensystemslab");
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });

  it("creates an invite to pay Checkout Session", async () => {
    mockCreatePaymentRequestCheckoutSessionDefaults();
    mockGetTeamBySlug.mockResolvedValue({
      ...stripeTeam,
      slug: "opensystemslab",
    });
    mockPaymentRequest(buildPaymentRequest({}, { flow: internalTeam }));

    await supertest(app).post(INVITE_TO_PAY_ENDPOINT).expect(200);

    expect(mockGetTeamBySlug).toHaveBeenCalledWith("opensystemslab");
    expect(mockCreate).toHaveBeenCalledTimes(1);
  });
});

describe.each(["staging", "development"])(
  "creating Checkout Sessions in %s",
  (environment) => {
    beforeEach(() => {
      vi.stubEnv("APP_ENVIRONMENT", environment);
    });

    it("creates a self-pay Checkout Session", async () => {
      mockCreateCheckoutSessionDefaults();

      await supertest(app).post(SELF_PAY_ENDPOINT).send(validBody).expect(200);

      expect(mockCreate).toHaveBeenCalledTimes(1);
    });

    it("creates an invite to pay Checkout Session", async () => {
      mockCreatePaymentRequestCheckoutSessionDefaults();

      await supertest(app).post(INVITE_TO_PAY_ENDPOINT).expect(200);

      expect(mockCreate).toHaveBeenCalledTimes(1);
    });
  },
);
