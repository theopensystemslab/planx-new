import type { Team } from "@opensystemslab/planx-core/types";

import {
  buildAuthoriseUrl,
  createOnboardingLink,
  createPrefilledTestAccount,
  exchangeCodeForAccountId,
  getStripeAccountId,
  getStripeMode,
  getTeamBySlug,
  isAccountReadyForPayments,
  isInvalidRequestError,
  isOnboardingComplete,
  postStripeConnectedToSlack,
  saveStripeAccountId,
} from "./service.js";

const mockSendSlackMessage = vi.hoisted(() => vi.fn());
vi.mock("../../slack/utils.js", () => ({
  sendSlackMessage: (...args: unknown[]) => mockSendSlackMessage(...args),
}));

const {
  mockAuthorizeUrl,
  mockToken,
  mockAccountsCreate,
  mockCreatePerson,
  mockAccountsRetrieve,
  mockAccountsUpdate,
  mockAccountLinksCreate,
  MockStripeError,
  MockStripeInvalidRequestError,
  MockStripePermissionError,
} = vi.hoisted(() => ({
  mockAuthorizeUrl: vi.fn(),
  mockToken: vi.fn(),
  mockAccountsCreate: vi.fn(),
  mockCreatePerson: vi.fn(),
  mockAccountsRetrieve: vi.fn(),
  mockAccountsUpdate: vi.fn(),
  mockAccountLinksCreate: vi.fn(),
  MockStripeError: class MockStripeError extends Error {},
  MockStripeInvalidRequestError: class MockStripeInvalidRequestError extends Error {},
  MockStripePermissionError: class MockStripePermissionError extends Error {},
}));

vi.mock("stripe", () => {
  class MockStripe {
    oauth = { authorizeUrl: mockAuthorizeUrl, token: mockToken };
    accounts = {
      create: mockAccountsCreate,
      createPerson: mockCreatePerson,
      retrieve: mockAccountsRetrieve,
      update: mockAccountsUpdate,
    };
    accountLinks = { create: mockAccountLinksCreate };
    static errors = {
      StripeError: MockStripeError,
      StripeInvalidRequestError: MockStripeInvalidRequestError,
      StripePermissionError: MockStripePermissionError,
    };
  }
  return { default: MockStripe };
});

const mockRequest = vi.fn();
const mockGetBySlug = vi.fn();
vi.mock("../../../client/index.js", () => ({
  $api: {
    client: { request: (...args: unknown[]) => mockRequest(...args) },
    team: { getBySlug: (...args: unknown[]) => mockGetBySlug(...args) },
  },
}));

describe("getTeamBySlug", () => {
  afterEach(() => {
    mockGetBySlug.mockReset();
  });

  it("returns the team when it exists", async () => {
    const team = { id: 1, slug: "lambeth" };
    mockGetBySlug.mockResolvedValue(team);

    await expect(getTeamBySlug("lambeth")).resolves.toBe(team);
    expect(mockGetBySlug).toHaveBeenCalledWith("lambeth");
  });

  it("throws a 404 when the team does not exist", async () => {
    mockGetBySlug.mockResolvedValue(null);

    await expect(getTeamBySlug("unknown")).rejects.toMatchObject({
      status: 404,
      message: "Team not found: unknown",
    });
  });
});

describe("buildAuthoriseUrl", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_CONNECT_CLIENT_ID", "ca_test123");
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
    vi.stubEnv("API_URL_EXT", "https://api.example.com");
    mockAuthorizeUrl.mockReturnValue(
      "https://connect.stripe.com/oauth/authorize?mock=1",
    );
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    mockAuthorizeUrl.mockReset();
  });

  it("delegates to the Stripe SDK with the client id, callback, and state", () => {
    const url = buildAuthoriseUrl("some-nonce");

    expect(url).toBe("https://connect.stripe.com/oauth/authorize?mock=1");
    expect(mockAuthorizeUrl).toHaveBeenCalledWith({
      response_type: "code",
      client_id: "ca_test123",
      scope: "read_write",
      redirect_uri: "https://api.example.com/stripe/connect/callback",
      state: "some-nonce",
      stripe_landing: "login",
    });
  });

  it("throws if STRIPE_CONNECT_CLIENT_ID is not configured", () => {
    vi.stubEnv("STRIPE_CONNECT_CLIENT_ID", undefined);

    expect(() => buildAuthoriseUrl("some-nonce")).toThrow(
      /STRIPE_CONNECT_CLIENT_ID/,
    );
  });
});

describe("createPrefilledTestAccount", () => {
  const team = {
    id: 1,
    slug: "lambeth",
    name: "Lambeth",
    settings: { homepage: "https://www.lambeth.gov.uk" },
  } as Team;

  const attestation = { ip: "203.0.113.1", userAgent: "Mozilla/5.0 (test)" };

  beforeEach(() => {
    mockAccountsCreate.mockResolvedValue({ id: "acct_new" });
  });

  afterEach(() => {
    mockAccountsCreate.mockReset();
    mockCreatePerson.mockReset();
    mockAccountsUpdate.mockReset();
  });

  it("creates a full dashboard account prefilled with the team and Stripe test data", async () => {
    const accountId = await createPrefilledTestAccount(team, attestation);

    expect(accountId).toBe("acct_new");
    expect(mockAccountsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        controller: expect.objectContaining({
          stripe_dashboard: { type: "full" },
          requirement_collection: "stripe",
        }),
        country: "GB",
        capabilities: {
          card_payments: { requested: true },
          transfers: { requested: true },
        },
        business_profile: expect.objectContaining({
          name: "Lambeth (test mode)",
          url: "https://www.lambeth.gov.uk",
          mcc: "9399",
          support_phone: "+447400123456",
          support_url: "https://www.lambeth.gov.uk",
        }),
        company: expect.objectContaining({
          name: "Lambeth (test mode)",
          structure: "public_corporation",
          tax_id: "12345678",
        }),
        external_account: expect.objectContaining({
          routing_number: "108800",
          account_number: "00012345",
        }),
      }),
    );
  });

  it("falls back to the PlanX website if the team has no homepage", async () => {
    await createPrefilledTestAccount(
      { ...team, settings: { ...team.settings, homepage: undefined } },
      attestation,
    );

    expect(mockAccountsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        business_profile: expect.objectContaining({
          url: "https://www.planx.uk",
        }),
      }),
    );
  });

  it("signs the directorship and representative declarations from the requesting user, after the director is added", async () => {
    await createPrefilledTestAccount(team, attestation);

    const declaration = {
      date: expect.any(Number),
      ip: "203.0.113.1",
      user_agent: "Mozilla/5.0 (test)",
    };
    expect(mockAccountsUpdate).toHaveBeenCalledWith("acct_new", {
      company: {
        directorship_declaration: declaration,
        representative_declaration: declaration,
      },
    });

    expect(mockAccountsCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        company: expect.not.objectContaining({
          directorship_declaration: expect.anything(),
        }),
      }),
    );
    expect(mockCreatePerson.mock.invocationCallOrder[0]).toBeLessThan(
      mockAccountsUpdate.mock.invocationCallOrder[0],
    );
  });

  it("adds a verified test representative, who is also the director", async () => {
    await createPrefilledTestAccount(team, attestation);

    expect(mockCreatePerson).toHaveBeenCalledWith(
      "acct_new",
      expect.objectContaining({
        dob: { day: 1, month: 1, year: 1901 },
        phone: "+447400123456",
        email: "stripe-test-representative@planx.uk",
        relationship: expect.objectContaining({
          representative: true,
          director: true,
        }),
        verification: {
          document: { front: "file_identity_document_success" },
          additional_document: { front: "file_identity_document_success" },
        },
      }),
    );
  });
});

describe("createOnboardingLink", () => {
  beforeEach(() => {
    vi.stubEnv("API_URL_EXT", "https://api.example.com");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    mockAccountLinksCreate.mockReset();
  });

  it("refreshes by restarting the connect flow, and returns to the onboarding return route", async () => {
    mockAccountLinksCreate.mockResolvedValue({
      url: "https://connect.stripe.com/setup/abc",
    });

    const url = await createOnboardingLink("acct_new", "lambeth");

    expect(url).toBe("https://connect.stripe.com/setup/abc");
    expect(mockAccountLinksCreate).toHaveBeenCalledWith({
      account: "acct_new",
      type: "account_onboarding",
      refresh_url: "https://api.example.com/stripe/connect/lambeth",
      return_url: "https://api.example.com/stripe/connect/lambeth/return",
    });
  });
});

describe("isOnboardingComplete", () => {
  afterEach(() => {
    mockAccountsRetrieve.mockReset();
  });

  it.each([true, false])(
    "returns the account's details_submitted (%s)",
    async (detailsSubmitted) => {
      mockAccountsRetrieve.mockResolvedValue({
        details_submitted: detailsSubmitted,
      });

      await expect(isOnboardingComplete("acct_new")).resolves.toBe(
        detailsSubmitted,
      );
      expect(mockAccountsRetrieve).toHaveBeenCalledWith("acct_new");
    },
  );
});

describe("isAccountReadyForPayments", () => {
  afterEach(() => {
    mockAccountsRetrieve.mockReset();
  });

  it("returns true for a connected account which can take payments", async () => {
    mockAccountsRetrieve.mockResolvedValue({ charges_enabled: true });

    await expect(isAccountReadyForPayments("acct_abc")).resolves.toBe(true);
    expect(mockAccountsRetrieve).toHaveBeenCalledWith("acct_abc");
  });

  it("returns false for a connected account which cannot take payments", async () => {
    mockAccountsRetrieve.mockResolvedValue({ charges_enabled: false });

    await expect(isAccountReadyForPayments("acct_abc")).resolves.toBe(false);
  });

  it("returns false when the account is not connected to the platform", async () => {
    mockAccountsRetrieve.mockRejectedValue(
      new MockStripePermissionError("does not have access to account"),
    );

    await expect(isAccountReadyForPayments("acct_other")).resolves.toBe(false);
  });

  it("returns false when the account does not exist", async () => {
    mockAccountsRetrieve.mockRejectedValue(
      new MockStripeInvalidRequestError("No such account"),
    );

    await expect(isAccountReadyForPayments("acct_missing")).resolves.toBe(
      false,
    );
  });

  it("rethrows other errors (e.g. Stripe being unreachable)", async () => {
    mockAccountsRetrieve.mockRejectedValue(new Error("Stripe is down"));

    await expect(isAccountReadyForPayments("acct_abc")).rejects.toThrow(
      "Stripe is down",
    );
  });
});

describe("isInvalidRequestError", () => {
  it("returns true for a Stripe invalid request error", () => {
    expect(
      isInvalidRequestError(
        new MockStripeInvalidRequestError("No such account"),
      ),
    ).toBe(true);
  });

  it.each([new MockStripeError("api error"), new Error("network error")])(
    "returns false for other errors (%s)",
    (error) => {
      expect(isInvalidRequestError(error)).toBe(false);
    },
  );
});

describe("exchangeCodeForAccountId", () => {
  beforeEach(() => {
    vi.stubEnv("STRIPE_SECRET_KEY", "sk_test_123");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
    mockToken.mockReset();
  });

  it("returns the connected account id on a successful exchange", async () => {
    mockToken.mockResolvedValue({ stripe_user_id: "acct_123" });

    const accountId = await exchangeCodeForAccountId("auth-code");

    expect(accountId).toBe("acct_123");
    expect(mockToken).toHaveBeenCalledWith({
      grant_type: "authorization_code",
      code: "auth-code",
    });
  });

  it("throws a ServerError when the Stripe SDK rejects", async () => {
    mockToken.mockRejectedValue(
      new MockStripeError("Authorization code already used"),
    );

    await expect(exchangeCodeForAccountId("used-code")).rejects.toThrow(
      /Authorization code already used/,
    );
  });

  it("throws a ServerError with a generic message for non-Stripe errors", async () => {
    mockToken.mockRejectedValue(new Error("socket hang up"));

    await expect(exchangeCodeForAccountId("auth-code")).rejects.toMatchObject({
      status: 502,
      message: "Stripe OAuth token exchange failed: Unknown error",
    });
  });

  it("throws a ServerError when no account id is returned", async () => {
    mockToken.mockResolvedValue({});

    await expect(exchangeCodeForAccountId("auth-code")).rejects.toThrow(
      /did not return a connected account id/,
    );
  });
});

describe("getStripeMode", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("returns test outside of production", () => {
    vi.stubEnv("APP_ENVIRONMENT", "staging");
    expect(getStripeMode()).toBe("test");
  });

  it("returns live in production", () => {
    vi.stubEnv("APP_ENVIRONMENT", "production");
    expect(getStripeMode()).toBe("live");
  });
});

describe("saveStripeAccountId / getStripeAccountId", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    mockRequest.mockReset();
  });

  it("writes to the staging column outside of production", async () => {
    vi.stubEnv("APP_ENVIRONMENT", "staging");
    mockRequest.mockResolvedValue({});

    await saveStripeAccountId(42, "acct_abc");

    const [query] = mockRequest.mock.calls[0];
    expect(String(query)).toContain("staging_stripe_account_id");
    expect(String(query)).not.toContain("production_stripe_account_id");
  });

  it("writes to the production column in production", async () => {
    vi.stubEnv("APP_ENVIRONMENT", "production");
    mockRequest.mockResolvedValue({});

    await saveStripeAccountId(42, "acct_abc");

    const [query] = mockRequest.mock.calls[0];
    expect(String(query)).toContain("production_stripe_account_id");
    expect(String(query)).not.toContain("staging_stripe_account_id");
  });

  it("sets the payment provider to Stripe only if the team has none", async () => {
    mockRequest.mockResolvedValue({});

    await saveStripeAccountId(42, "acct_abc");

    const [query, variables] = mockRequest.mock.calls[0];
    expect(String(query)).toMatch(
      /update_team_settings\(\s*where: {\s*team_id: { _eq: \$teamId }\s*payment_provider: { _is_null: true }\s*}\s*_set: { payment_provider: "stripe" }/,
    );
    expect(variables).toEqual({ teamId: 42, accountId: "acct_abc" });
  });

  it("reads back the account id for the current environment", async () => {
    vi.stubEnv("APP_ENVIRONMENT", "staging");
    mockRequest.mockResolvedValue({
      teamIntegrations: [{ accountId: "acct_abc" }],
    });

    const accountId = await getStripeAccountId(42);

    expect(accountId).toBe("acct_abc");
  });

  it("returns null when no team_integrations row exists", async () => {
    mockRequest.mockResolvedValue({ teamIntegrations: [] });

    const accountId = await getStripeAccountId(42);

    expect(accountId).toBeNull();
  });
});

describe("postStripeConnectedToSlack", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
    mockSendSlackMessage.mockReset();
  });

  it("posts to Slack in production, labelled as live mode", async () => {
    vi.stubEnv("APP_ENVIRONMENT", "production");
    mockSendSlackMessage.mockResolvedValue(undefined);

    await postStripeConnectedToSlack("lambeth", "acct_123");

    expect(mockSendSlackMessage).toHaveBeenCalledWith(
      ":link: *lambeth* has connected their Stripe account in *live* mode and completed onboarding - `acct_123`",
    );
  });

  it("posts to Slack in staging, labelled as test mode", async () => {
    vi.stubEnv("APP_ENVIRONMENT", "staging");
    mockSendSlackMessage.mockResolvedValue(undefined);

    await postStripeConnectedToSlack("lambeth", "acct_123");

    expect(mockSendSlackMessage).toHaveBeenCalledWith(
      ":link: *lambeth* has connected their Stripe account in *test* mode and completed onboarding - `acct_123`",
    );
  });

  it("skips posting in local development", async () => {
    vi.stubEnv("APP_ENVIRONMENT", "development");

    await postStripeConnectedToSlack("lambeth", "acct_123");

    expect(mockSendSlackMessage).not.toHaveBeenCalled();
  });

  it("does not throw if Slack fails", async () => {
    vi.stubEnv("APP_ENVIRONMENT", "production");
    mockSendSlackMessage.mockRejectedValue(new Error("Slack is down"));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);

    await expect(
      postStripeConnectedToSlack("lambeth", "acct_123"),
    ).resolves.toBeUndefined();
    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
