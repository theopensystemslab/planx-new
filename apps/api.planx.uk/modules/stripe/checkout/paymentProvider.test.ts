import supertest from "supertest";

import app from "../../../server.js";
import {
  feeBreakdownPassport,
  mockCreate,
  mockCreateCheckoutSessionDefaults,
  mockGetPaymentCapabilities,
  mockGetStripeAccounts,
  mockGetTeamBySlug,
  mockPassportLookup,
  mockReturnURLContext,
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
    mockGetStripeAccounts.mockResolvedValue([]);

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(409);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("rejects a team whose account isn't connected in this environment with a 409", async () => {
    mockGetStripeAccounts.mockResolvedValue([
      { name: "Southwark", accountId: null },
    ]);

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(409)
      .then((res) => {
        expect(res.body.error).toBe(
          "This local authority (southwark) has not connected a Stripe account",
        );
      });

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("checks the connected account before creating the session", async () => {
    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(200);

    expect(mockGetPaymentCapabilities).toHaveBeenCalledWith(STRIPE_ACCOUNT_ID);
  });

  it("rejects a team whose Stripe account is not connected to the platform, or cannot take payments, with a 409", async () => {
    mockGetPaymentCapabilities.mockResolvedValue(null);

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(409);

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("surfaces an error when the connected account check fails", async () => {
    mockGetPaymentCapabilities.mockRejectedValue(new Error("Stripe is down"));

    await supertest(app)
      .post("/stripe/checkout-session/southwark")
      .send(validBody)
      .expect(500);

    expect(mockCreate).not.toHaveBeenCalled();
  });
});

describe("resolving the Stripe account for a team with multiple accounts", () => {
  const ENDPOINT = "/stripe/checkout-session/adur-worthing";

  const mockSiteDistricts = (districts?: string[]) =>
    mockPassportLookup({
      ...feeBreakdownPassport,
      ...(districts && { "property.localAuthorityDistrict": districts }),
    });

  beforeEach(() => {
    mockCreateCheckoutSessionDefaults();
    mockGetTeamBySlug.mockResolvedValue({
      id: 2,
      slug: "adur-worthing",
      settings: { paymentProvider: "stripe" },
    });
    mockGetStripeAccounts.mockResolvedValue([
      { name: "Adur", accountId: "acct_adur" },
      { name: "Worthing", accountId: "acct_worthing" },
    ]);
    mockReturnURLContext({
      flow: { slug: "apply", team: { slug: "adur-worthing", domain: null } },
    });
  });

  it("pays into the account for the site's local authority district", async () => {
    mockSiteDistricts(["Worthing"]);

    await supertest(app).post(ENDPOINT).send(validBody).expect(200);

    expect(mockGetPaymentCapabilities).toHaveBeenCalledWith("acct_worthing");
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        payment_intent_data: expect.objectContaining({
          on_behalf_of: "acct_worthing",
          transfer_data: { destination: "acct_worthing" },
        }),
      }),
    );
  });

  it("refuses a site without a local authority district with a 409", async () => {
    mockSiteDistricts();

    await supertest(app)
      .post(ENDPOINT)
      .send(validBody)
      .expect(409)
      .then((res) => {
        expect(res.body.error).toBe(
          "Could not choose a Stripe account for this local authority (adur-worthing) - the site's local authority district doesn't match any of its Stripe accounts",
        );
      });

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("refuses a site on the boundary of both accounts' districts with a 409", async () => {
    mockSiteDistricts(["Adur", "Worthing"]);

    await supertest(app)
      .post(ENDPOINT)
      .send(validBody)
      .expect(409)
      .then((res) => {
        expect(res.body.error).toBe(
          "Could not choose a Stripe account for this local authority (adur-worthing) - the site is in the area of more than one of its Stripe accounts",
        );
      });

    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("refuses, without falling back to another account, if the site's account isn't connected", async () => {
    mockGetStripeAccounts.mockResolvedValue([
      { name: "Adur", accountId: "acct_adur" },
      { name: "Worthing", accountId: null },
    ]);
    mockSiteDistricts(["Worthing"]);

    await supertest(app)
      .post(ENDPOINT)
      .send(validBody)
      .expect(409)
      .then((res) => {
        expect(res.body.error).toBe(
          "This local authority (adur-worthing) has not connected its Stripe account (Worthing)",
        );
      });

    expect(mockGetPaymentCapabilities).not.toHaveBeenCalled();
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it("names the account if it can't take payments", async () => {
    mockGetPaymentCapabilities.mockResolvedValue(null);
    mockSiteDistricts(["Adur"]);

    await supertest(app)
      .post(ENDPOINT)
      .send(validBody)
      .expect(409)
      .then((res) => {
        expect(res.body.error).toBe(
          "The Stripe account (Adur) for this local authority (adur-worthing) is not connected or cannot take payments",
        );
      });
  });
});
