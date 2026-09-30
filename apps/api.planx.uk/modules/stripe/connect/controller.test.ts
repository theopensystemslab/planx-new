import * as Controller from "./controller.js";
import type { ConnectStatusResponse } from "./types.js";

const mockGenerateNonce = vi.fn();
const mockSetConnectState = vi.fn();
const mockVerifyState = vi.fn();
const mockGetPendingOnboarding = vi.fn();
const mockSetPendingOnboarding = vi.fn();
const mockClearPendingOnboarding = vi.fn();
vi.mock("./middleware.js", () => ({
  generateNonce: (...args: unknown[]) => mockGenerateNonce(...args),
  setConnectState: (...args: unknown[]) => mockSetConnectState(...args),
  verifyState: (...args: unknown[]) => mockVerifyState(...args),
  getPendingOnboarding: (...args: unknown[]) =>
    mockGetPendingOnboarding(...args),
  setPendingOnboarding: (...args: unknown[]) =>
    mockSetPendingOnboarding(...args),
  clearPendingOnboarding: (...args: unknown[]) =>
    mockClearPendingOnboarding(...args),
}));

const mockBuildAuthoriseUrl = vi.fn();
const mockGetStripeAccountId = vi.fn();
const mockGetStripeMode = vi.fn();
const mockExchangeCodeForAccountId = vi.fn();
const mockSaveStripeAccountId = vi.fn();
const mockCanConnectStripeAccount = vi.fn();
const mockCreatePrefilledTestAccount = vi.fn();
const mockCreateOnboardingLink = vi.fn();
const mockIsOnboardingComplete = vi.fn();
const mockIsInvalidRequestError = vi.fn();
vi.mock("./service.js", () => ({
  createPrefilledTestAccount: (...args: unknown[]) =>
    mockCreatePrefilledTestAccount(...args),
  createOnboardingLink: (...args: unknown[]) =>
    mockCreateOnboardingLink(...args),
  isOnboardingComplete: (...args: unknown[]) =>
    mockIsOnboardingComplete(...args),
  isInvalidRequestError: (...args: unknown[]) =>
    mockIsInvalidRequestError(...args),
  buildAuthoriseUrl: (...args: unknown[]) => mockBuildAuthoriseUrl(...args),
  getStripeAccountId: (...args: unknown[]) => mockGetStripeAccountId(...args),
  getStripeMode: (...args: unknown[]) => mockGetStripeMode(...args),
  canConnectStripeAccount: (...args: unknown[]) =>
    mockCanConnectStripeAccount(...args),
  exchangeCodeForAccountId: (...args: unknown[]) =>
    mockExchangeCodeForAccountId(...args),
  saveStripeAccountId: (...args: unknown[]) => mockSaveStripeAccountId(...args),
}));

// each controller has its own res.locals shape so we use any here
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const buildReq = (): any => ({
  ip: "203.0.113.1",
  get: (header: string) =>
    header === "user-agent" ? "Mozilla/5.0 (test)" : undefined,
});

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
  mockGetStripeMode.mockReset().mockReturnValue("test");
  mockExchangeCodeForAccountId.mockReset();
  mockSaveStripeAccountId.mockReset();
  mockCanConnectStripeAccount.mockReset().mockResolvedValue(true);
  mockGetPendingOnboarding.mockReset();
  mockSetPendingOnboarding.mockReset();
  mockClearPendingOnboarding.mockReset();
  mockCreatePrefilledTestAccount.mockReset();
  mockCreateOnboardingLink.mockReset();
  mockIsInvalidRequestError.mockReset().mockReturnValue(false);
  mockIsOnboardingComplete.mockReset();
});

afterEach(() => {
  process.env = { ...originalEnv };
});

describe("initiateConnect", () => {
  // Live mode uses OAuth - canConnectStripeAccount passes by default
  beforeEach(() => {
    mockGetStripeMode.mockReturnValue("live");
  });

  it("saves connect state for the team, and redirects to the Stripe authorise URL", async () => {
    mockBuildAuthoriseUrl.mockReturnValue(
      "https://connect.stripe.com/oauth/authorize?mock=1",
    );

    const req = buildReq();
    const team = { id: 1, slug: "lambeth" };
    const res = buildRes({ team });
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

  it("redirects back with an error if the team cannot connect yet", async () => {
    mockCanConnectStripeAccount.mockResolvedValue(false);

    const res = buildRes({ team: { id: 1, slug: "lambeth" } });
    const next = vi.fn();

    await Controller.initiateConnect(buildReq(), res, next);

    expect(mockCanConnectStripeAccount).toHaveBeenCalledWith("lambeth");
    expect(res.redirect).toHaveBeenCalledWith(
      "https://editor.example.com/app/lambeth/settings/payments?stripeError=staging_required",
    );
    expect(mockSetConnectState).not.toHaveBeenCalled();
    expect(mockBuildAuthoriseUrl).not.toHaveBeenCalled();
    expect(next).not.toHaveBeenCalled();
  });

  it("forwards a ServerError if the staging check fails", async () => {
    mockCanConnectStripeAccount.mockRejectedValue(new Error("staging down"));

    const res = buildRes({ team: { id: 1, slug: "lambeth" } });
    const next = vi.fn();

    await Controller.initiateConnect(buildReq(), res, next);

    expect(res.redirect).not.toHaveBeenCalled();
    expect(mockBuildAuthoriseUrl).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Failed to start Stripe Connect onboarding",
      }),
    );
  });
});

describe("initiateConnect (staging onboarding)", () => {
  const team = { id: 1, slug: "lambeth" };

  beforeEach(() => {
    mockGetStripeMode.mockReturnValue("test");
    mockCreateOnboardingLink.mockResolvedValue(
      "https://connect.stripe.com/setup/abc",
    );
  });

  it("creates a prefilled test account, remembers it as pending, and redirects to onboarding", async () => {
    mockGetPendingOnboarding.mockReturnValue(undefined);
    mockCreatePrefilledTestAccount.mockResolvedValue("acct_new");

    const req = buildReq();
    const res = buildRes({ team });
    const next = vi.fn();

    await Controller.initiateConnect(req, res, next);

    expect(mockCreatePrefilledTestAccount).toHaveBeenCalledWith(team, {
      ip: "203.0.113.1",
      userAgent: "Mozilla/5.0 (test)",
    });
    expect(mockSetPendingOnboarding).toHaveBeenCalledWith(req, {
      teamId: 1,
      accountId: "acct_new",
    });
    expect(mockCreateOnboardingLink).toHaveBeenCalledWith(
      "acct_new",
      "lambeth",
    );
    expect(res.redirect).toHaveBeenCalledWith(
      "https://connect.stripe.com/setup/abc",
    );
    expect(mockBuildAuthoriseUrl).not.toHaveBeenCalled();
    expect(mockSaveStripeAccountId).not.toHaveBeenCalled();
  });

  it("resumes the pending account rather than creating another", async () => {
    mockGetPendingOnboarding.mockReturnValue({
      teamId: 1,
      accountId: "acct_pending",
    });

    const req = buildReq();
    const res = buildRes({ team });

    await Controller.initiateConnect(req, res, vi.fn());

    expect(mockGetPendingOnboarding).toHaveBeenCalledWith(req, 1);
    expect(mockCreatePrefilledTestAccount).not.toHaveBeenCalled();
    expect(mockCreateOnboardingLink).toHaveBeenCalledWith(
      "acct_pending",
      "lambeth",
    );
  });

  it("clears the pending account and forwards a ServerError if Stripe rejects it", async () => {
    mockGetPendingOnboarding.mockReturnValue({
      teamId: 1,
      accountId: "acct_pending",
    });
    mockCreateOnboardingLink.mockRejectedValue(new Error("account rejected"));
    mockIsInvalidRequestError.mockReturnValue(true);

    const req = buildReq();
    const res = buildRes({ team });
    const next = vi.fn();

    await Controller.initiateConnect(req, res, next);

    expect(mockClearPendingOnboarding).toHaveBeenCalledWith(req);
    expect(res.redirect).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Failed to start Stripe Connect onboarding",
      }),
    );
  });

  it("keeps the pending account if the onboarding link fails for another reason", async () => {
    mockGetPendingOnboarding.mockReturnValue({
      teamId: 1,
      accountId: "acct_pending",
    });
    mockCreateOnboardingLink.mockRejectedValue(new Error("network error"));

    const res = buildRes({ team });
    const next = vi.fn();

    await Controller.initiateConnect(buildReq(), res, next);

    expect(mockClearPendingOnboarding).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Failed to start Stripe Connect onboarding",
      }),
    );
  });

  it("keeps a newly created account pending if the onboarding link fails", async () => {
    mockGetPendingOnboarding.mockReturnValue(undefined);
    mockCreatePrefilledTestAccount.mockResolvedValue("acct_new");
    mockCreateOnboardingLink.mockRejectedValue(new Error("account rejected"));
    mockIsInvalidRequestError.mockReturnValue(true);

    const res = buildRes({ team });
    const next = vi.fn();

    const req = buildReq();

    await Controller.initiateConnect(req, res, next);

    expect(mockSetPendingOnboarding).toHaveBeenCalledWith(req, {
      teamId: 1,
      accountId: "acct_new",
    });
    expect(mockClearPendingOnboarding).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        message: "Failed to start Stripe Connect onboarding",
      }),
    );
  });
});

describe("handleOnboardingReturn", () => {
  const team = { id: 1, slug: "lambeth" };

  it("redirects with an invalid_state error if there is no pending account for the team", async () => {
    mockGetPendingOnboarding.mockReturnValue(undefined);

    const res = buildRes({ team });

    await Controller.handleOnboardingReturn(buildReq(), res, vi.fn());

    expect(mockIsOnboardingComplete).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      "https://editor.example.com/app/lambeth/settings/payments?stripeError=invalid_state",
    );
  });

  it("saves the account, clears the pending state, and redirects with stripeConnected once onboarding is complete", async () => {
    mockGetPendingOnboarding.mockReturnValue({
      teamId: 1,
      accountId: "acct_pending",
    });
    mockIsOnboardingComplete.mockResolvedValue(true);

    const req = buildReq();
    const res = buildRes({ team });

    await Controller.handleOnboardingReturn(req, res, vi.fn());

    expect(mockSaveStripeAccountId).toHaveBeenCalledWith(1, "acct_pending");
    expect(mockClearPendingOnboarding).toHaveBeenCalledWith(req);
    expect(res.redirect).toHaveBeenCalledWith(
      "https://editor.example.com/app/lambeth/settings/payments?stripeConnected=true",
    );
  });

  it("keeps the pending account and doesn't save it if onboarding was left unfinished", async () => {
    mockGetPendingOnboarding.mockReturnValue({
      teamId: 1,
      accountId: "acct_pending",
    });
    mockIsOnboardingComplete.mockResolvedValue(false);

    const res = buildRes({ team });

    await Controller.handleOnboardingReturn(buildReq(), res, vi.fn());

    expect(mockSaveStripeAccountId).not.toHaveBeenCalled();
    expect(mockClearPendingOnboarding).not.toHaveBeenCalled();
    expect(res.redirect).toHaveBeenCalledWith(
      "https://editor.example.com/app/lambeth/settings/payments?stripeError=onboarding_incomplete",
    );
  });

  it("redirects with a connect_failed error if checking or saving the account throws", async () => {
    mockGetPendingOnboarding.mockReturnValue({
      teamId: 1,
      accountId: "acct_pending",
    });
    mockIsOnboardingComplete.mockRejectedValue(new Error("stripe down"));
    vi.spyOn(console, "error").mockImplementation(() => {});

    const res = buildRes({ team });

    await Controller.handleOnboardingReturn(buildReq(), res, vi.fn());

    expect(res.redirect).toHaveBeenCalledWith(
      "https://editor.example.com/app/lambeth/settings/payments?stripeError=connect_failed",
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
      canConnect: true,
    };

    expect(res.send).toHaveBeenCalledWith(expected);
    expect(next).not.toHaveBeenCalled();
  });

  it("returns 'not connected' when no account id is stored", async () => {
    mockGetStripeAccountId.mockResolvedValue(null);
    mockGetStripeMode.mockReturnValue("live");
    mockCanConnectStripeAccount.mockResolvedValue(true);

    const res = buildRes({ team: { id: 1, slug: "lambeth" } });
    const next = vi.fn();

    await Controller.getConnectStatus(buildReq(), res, next);

    const expected: ConnectStatusResponse = {
      connected: false,
      accountId: null,
      mode: "live",
      canConnect: true,
    };
    expect(res.send).toHaveBeenCalledWith(expected);
  });

  it("cannot connect a live account until Stripe is enabled on staging", async () => {
    mockGetStripeAccountId.mockResolvedValue(null);
    mockGetStripeMode.mockReturnValue("live");
    mockCanConnectStripeAccount.mockResolvedValue(false);

    const res = buildRes({ team: { id: 1, slug: "lambeth" } });

    await Controller.getConnectStatus(buildReq(), res, vi.fn());

    expect(mockCanConnectStripeAccount).toHaveBeenCalledWith("lambeth");
    expect(res.send).toHaveBeenCalledWith(
      expect.objectContaining({ canConnect: false }),
    );
  });

  it("forwards a ServerError if the staging check fails", async () => {
    mockGetStripeAccountId.mockResolvedValue(null);
    mockGetStripeMode.mockReturnValue("live");
    mockCanConnectStripeAccount.mockRejectedValue(new Error("staging down"));

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
