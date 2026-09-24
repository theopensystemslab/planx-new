import {
  buildAuthoriseUrl,
  exchangeCodeForAccountId,
  getStripeAccountId,
  getStripeMode,
  getTeamBySlug,
  saveStripeAccountId,
} from "./service.js";

const { mockAuthorizeUrl, mockToken, MockStripeError } = vi.hoisted(() => ({
  mockAuthorizeUrl: vi.fn(),
  mockToken: vi.fn(),
  MockStripeError: class MockStripeError extends Error {},
}));

vi.mock("stripe", () => {
  class MockStripe {
    oauth = { authorizeUrl: mockAuthorizeUrl, token: mockToken };
    static errors = { StripeError: MockStripeError };
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
    });
  });

  it("throws if STRIPE_CONNECT_CLIENT_ID is not configured", () => {
    vi.stubEnv("STRIPE_CONNECT_CLIENT_ID", undefined);

    expect(() => buildAuthoriseUrl("some-nonce")).toThrow(
      /STRIPE_CONNECT_CLIENT_ID/,
    );
  });
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
