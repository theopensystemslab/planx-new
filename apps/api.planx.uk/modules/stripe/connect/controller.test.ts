import * as Controller from "./controller.js";
import type { ConnectStatusResponse } from "./types.js";

const mockGenerateNonce = vi.fn();
const mockSetConnectState = vi.fn();
const mockVerifyState = vi.fn();
vi.mock("./middleware.js", () => ({
  generateNonce: (...args: unknown[]) => mockGenerateNonce(...args),
  setConnectState: (...args: unknown[]) => mockSetConnectState(...args),
  verifyState: (...args: unknown[]) => mockVerifyState(...args),
}));

const mockBuildAuthoriseUrl = vi.fn();
const mockGetStripeAccountId = vi.fn();
const mockGetStripeMode = vi.fn();
const mockExchangeCodeForAccountId = vi.fn();
const mockSaveStripeAccountId = vi.fn();
vi.mock("./service.js", () => ({
  buildAuthoriseUrl: (...args: unknown[]) => mockBuildAuthoriseUrl(...args),
  getStripeAccountId: (...args: unknown[]) => mockGetStripeAccountId(...args),
  getStripeMode: (...args: unknown[]) => mockGetStripeMode(...args),
  exchangeCodeForAccountId: (...args: unknown[]) =>
    mockExchangeCodeForAccountId(...args),
  saveStripeAccountId: (...args: unknown[]) => mockSaveStripeAccountId(...args),
}));

// each controller has its own res.locals shape so we use any here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buildReq = (): any => ({});

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buildRes = (locals: Record<string, unknown>): any => ({
  locals,
  redirect: vi.fn(),
  send: vi.fn(),
});

const originalEnv = { ...process.env };

beforeEach(() => {
  process.env.EDITOR_URL_EXT = "https://editor.example.com";
  mockGenerateNonce.mockReset().mockReturnValue("nonce-123");
  mockSetConnectState.mockReset();
  mockVerifyState.mockReset();
  mockBuildAuthoriseUrl.mockReset();
  mockGetStripeAccountId.mockReset();
  mockGetStripeMode.mockReset();
  mockExchangeCodeForAccountId.mockReset();
  mockSaveStripeAccountId.mockReset();
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("initiateConnect", () => {
  it("saves connect state for the team, and redirects to the Stripe authorise URL", async () => {
    mockBuildAuthoriseUrl.mockReturnValue(
      "https://connect.stripe.com/oauth/authorize?mock=1",
    );

    const req = buildReq();
    const res = buildRes({ team: { id: 1, slug: "lambeth" } });
    const next = vi.fn();

    await Controller.initiateConnect(req, res, next);

    expect(mockSetConnectState).toHaveBeenCalledWith(req, {
      teamId: 1,
      teamSlug: "lambeth",
      nonce: "nonce-123",
    });
    expect(mockBuildAuthoriseUrl).toHaveBeenCalledWith("nonce-123");
    expect(res.redirect).toHaveBeenCalledWith(
      "https://connect.stripe.com/oauth/authorize?mock=1",
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards a ServerError if building the authorise URL fails", async () => {
    mockBuildAuthoriseUrl.mockImplementation(() => {
      throw new Error("invalid url");
    });

    const res = buildRes({ team: { id: 1, slug: "lambeth" } });
    const next = vi.fn();

    await Controller.initiateConnect(buildReq(), res, next);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Failed to start Stripe Connect onboarding",
      }),
    );
  });
});

describe("getConnectStatus", () => {
  it("returns connected status, account id, and mode", async () => {
    mockGetStripeAccountId.mockResolvedValue("acct_123");
    mockGetStripeMode.mockReturnValue("test");

    const res = buildRes({ team: { id: 1, slug: "lambeth" } });
    const next = vi.fn();

    await Controller.getConnectStatus(buildReq(), res, next);

    expect(mockGetStripeAccountId).toHaveBeenCalledWith(1);
    const expected: ConnectStatusResponse = {
      connected: true,
      accountId: "acct_123",
      mode: "test",
    };

    expect(res.send).toHaveBeenCalledWith(expected);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 'not connected' when no account id is stored", async () => {
    mockGetStripeAccountId.mockResolvedValue(null);
    mockGetStripeMode.mockReturnValue("live");

    const res = buildRes({ team: { id: 1, slug: "lambeth" } });
    const next = vi.fn();

    await Controller.getConnectStatus(buildReq(), res, next);

    const expected: ConnectStatusResponse = {
      connected: false,
      accountId: null,
      mode: "live",
    };
    expect(res.send).toHaveBeenCalledWith(expected);
  });

  it("forwards a ServerError if the lookup fails", async () => {
    mockGetStripeAccountId.mockRejectedValue(new Error("db down"));

    const res = buildRes({ team: { id: 1, slug: "lambeth" } });
    const next = vi.fn();

    await Controller.getConnectStatus(buildReq(), res, next);

    expect(res.send).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Failed to fetch Stripe Connect status",
      }),
    );
  });
});

describe("handleCallback", () => {
  const buildReqRes = (query: Record<string, string | undefined>) => ({
    req: buildReq(),
    res: buildRes({ parsedReq: { query } }),
  });

  it("redirects to the homepage with an error if the saved state cannot be verified", async () => {
    mockVerifyState.mockReturnValue(undefined);
    const { req, res } = buildReqRes({ code: "abc", state: "bad-nonce" });

    await Controller.handleCallback(req, res, vi.fn());

    expect(res.redirect).toHaveBeenCalledWith(
      "https://editor.example.com/app?stripeError=invalid_state",
    );
    expect(mockExchangeCodeForAccountId).not.toHaveBeenCalled();
  });

  it("redirects to the team's payments page with the Stripe error if the council declines consent", async () => {
    mockVerifyState.mockReturnValue({
      teamId: 1,
      teamSlug: "lambeth",
      nonce: "abc",
    });
    const { req, res } = buildReqRes({ error: "access_denied", state: "abc" });

    await Controller.handleCallback(req, res, vi.fn());

    expect(res.redirect).toHaveBeenCalledWith(
      "https://editor.example.com/app/lambeth/settings/payments?stripeError=access_denied",
    );
    expect(mockExchangeCodeForAccountId).not.toHaveBeenCalled();
  });

  it("redirects with a missing_code error if no code is returned and there is no explicit error", async () => {
    mockVerifyState.mockReturnValue({
      teamId: 1,
      teamSlug: "lambeth",
      nonce: "abc",
    });
    const { req, res } = buildReqRes({ state: "abc" });

    await Controller.handleCallback(req, res, vi.fn());

    expect(res.redirect).toHaveBeenCalledWith(
      "https://editor.example.com/app/lambeth/settings/payments?stripeError=missing_code",
    );
  });

  it("exchanges the code, saves the account id, and redirects with stripeConnected on success", async () => {
    mockVerifyState.mockReturnValue({
      teamId: 1,
      teamSlug: "lambeth",
      nonce: "abc",
    });
    mockExchangeCodeForAccountId.mockResolvedValue("acct_123");
    mockSaveStripeAccountId.mockResolvedValue(undefined);
    const { req, res } = buildReqRes({ code: "auth-code", state: "abc" });

    await Controller.handleCallback(req, res, vi.fn());

    expect(mockExchangeCodeForAccountId).toHaveBeenCalledWith("auth-code");
    expect(mockSaveStripeAccountId).toHaveBeenCalledWith(1, "acct_123");
    expect(res.redirect).toHaveBeenCalledWith(
      "https://editor.example.com/app/lambeth/settings/payments?stripeConnected=true",
    );
  });

  it("redirects with a connect_failed error if exchanging or saving the account id throws", async () => {
    mockVerifyState.mockReturnValue({
      teamId: 1,
      teamSlug: "lambeth",
      nonce: "abc",
    });
    mockExchangeCodeForAccountId.mockRejectedValue(new Error("Stripe is down"));
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => undefined);
    const { req, res } = buildReqRes({ code: "auth-code", state: "abc" });

    await Controller.handleCallback(req, res, vi.fn());

    expect(mockSaveStripeAccountId).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      "https://editor.example.com/app/lambeth/settings/payments?stripeError=connect_failed",
    );
    consoleError.mockRestore();
  });
});
