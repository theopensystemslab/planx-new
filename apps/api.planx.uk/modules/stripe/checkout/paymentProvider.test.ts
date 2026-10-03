import supertest from "supertest";

import app from "../../../server.js";
import {
  mockCreate,
  mockCreateCheckoutSessionDefaults,
  mockGetStripeAccountId,
  mockGetTeamBySlug,
  mockIsAccountReadyForPayments,
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

describe("resolving the team's Stripe account", () => {
  beforeEach(() => {
    mockCreateCheckoutSessionDefaults();
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
});
