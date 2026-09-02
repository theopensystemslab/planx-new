import {
  buildAuthoriseUrl,
  exchangeCodeForAccountId,
  getStripeAccountId,
  getStripeMode,
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
vi.mock("../../client/index.js", () => ({
  $api: { client: { request: (...args: unknown[]) => mockRequest(...args) } },
}));

describe("buildAuthoriseUrl", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.STRIPE_CONNECT_CLIENT_ID = "ca_test123";
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
    process.env.API_URL_EXT = "https://api.example.com";
    mockAuthorizeUrl.mockReturnValue(
      "https://connect.stripe.com/oauth/authorize?mock=1",
    );
  });

  afterEach(() => {
    process.env = { ...originalEnv };
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
    delete process.env.STRIPE_CONNECT_CLIENT_ID;

    expect(() => buildAuthoriseUrl("some-nonce")).toThrow(
      /STRIPE_CONNECT_CLIENT_ID/,
    );
  });

  it("throws if STRIPE_SECRET_KEY is not configured", () => {
    delete process.env.STRIPE_SECRET_KEY;

    expect(() => buildAuthoriseUrl("some-nonce")).toThrow(/STRIPE_SECRET_KEY/);
  });
});

describe("exchangeCodeForAccountId", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = "sk_test_123";
  });

  afterEach(() => {
    process.env = { ...originalEnv };
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

  it("throws a ServerError when no account id is returned", async () => {
    mockToken.mockResolvedValue({});

    await expect(exchangeCodeForAccountId("auth-code")).rejects.toThrow(
      /did not return a connected account id/,
    );
  });

  it("throws if STRIPE_SECRET_KEY is not configured", async () => {
    delete process.env.STRIPE_SECRET_KEY;

    await expect(exchangeCodeForAccountId("auth-code")).rejects.toThrow(
      /STRIPE_SECRET_KEY/,
    );
  });
});

describe("getStripeMode", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it("returns test outside of production", () => {
    process.env.APP_ENVIRONMENT = "staging";
    expect(getStripeMode()).toBe("test");
  });

  it("returns live in production", () => {
    process.env.APP_ENVIRONMENT = "production";
    expect(getStripeMode()).toBe("live");
  });
});

describe("saveStripeAccountId / getStripeAccountId", () => {
  const originalEnv = { ...process.env };

  afterEach(() => {
    process.env = { ...originalEnv };
    mockRequest.mockReset();
  });

  it("writes to the staging column outside of production", async () => {
    process.env.APP_ENVIRONMENT = "staging";
    mockRequest.mockResolvedValue({});

    await saveStripeAccountId(42, "acct_abc");

    const [query] = mockRequest.mock.calls[0];
    expect(String(query)).toContain("staging_stripe_account_id");
    expect(String(query)).not.toContain("production_stripe_account_id");
  });

  it("writes to the production column in production", async () => {
    process.env.APP_ENVIRONMENT = "production";
    mockRequest.mockResolvedValue({});

    await saveStripeAccountId(42, "acct_abc");

    const [query] = mockRequest.mock.calls[0];
    expect(String(query)).toContain("production_stripe_account_id");
    expect(String(query)).not.toContain("staging_stripe_account_id");
  });

  it("reads back the account id for the current environment", async () => {
    process.env.APP_ENVIRONMENT = "staging";
    mockRequest.mockResolvedValue({
      team_integrations: [{ accountId: "acct_abc" }],
    });

    const accountId = await getStripeAccountId(42);

    expect(accountId).toBe("acct_abc");
  });

  it("returns null when no team_integrations row exists", async () => {
    mockRequest.mockResolvedValue({ team_integrations: [] });

    const accountId = await getStripeAccountId(42);

    expect(accountId).toBeNull();
  });
});
