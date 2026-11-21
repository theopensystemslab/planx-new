import type { Request } from "express";
import z from "zod";

import { ServerError } from "../../../errors/index.js";
import {
  clearPendingOnboarding,
  consumeConnectState,
  generateNonce,
  getPendingOnboarding,
  requireNamedStripeAccountsEnabled,
  requireStripeConnectTeamAuth,
  setConnectState,
  setPendingOnboarding,
  verifyState,
} from "./middleware.js";

const mockGetTeamBySlug = vi.fn();
const mockIsMultipleStripeAccountsEnabled = vi.fn();
vi.mock("./service.js", () => ({
  getTeamBySlug: (...args: unknown[]) => mockGetTeamBySlug(...args),
  isMultipleStripeAccountsEnabled: (...args: unknown[]) =>
    mockIsMultipleStripeAccountsEnabled(...args),
}));

const mockAssertTeamEditPermission = vi.fn();
vi.mock("../../auth/requireTeamMembership.js", () => ({
  assertTeamEditPermission: (...args: unknown[]) =>
    mockAssertTeamEditPermission(...args),
}));

const buildRequest = (): Request => ({ session: {} }) as unknown as Request;

describe("setConnectState / verifyState", () => {
  it("returns the saved state when the nonce matches", () => {
    const req = buildRequest();
    setConnectState(req, {
      teamId: 1,
      teamSlug: "buckinghamshire",
      nonce: "abc",
    });

    const result = verifyState(req, "abc");

    expect(result).toEqual({
      teamId: 1,
      teamSlug: "buckinghamshire",
      nonce: "abc",
    });
  });

  it("clears the session state after verifying, preventing replay", () => {
    const req = buildRequest();
    setConnectState(req, { teamId: 1, teamSlug: "lambeth", nonce: "abc" });

    verifyState(req, "abc");
    const secondAttempt = verifyState(req, "abc");

    expect(secondAttempt).toBeUndefined();
  });

  it("returns undefined when the nonce does not match", () => {
    const req = buildRequest();
    setConnectState(req, { teamId: 1, teamSlug: "lambeth", nonce: "abc" });

    expect(verifyState(req, "wrong-nonce")).toBeUndefined();
  });

  it("returns undefined when no state was ever saved", () => {
    const req = buildRequest();

    expect(verifyState(req, "abc")).toBeUndefined();
  });

  it("returns undefined when the saved state doesn't match the expected shape", () => {
    const req = {
      session: { stripeConnect: { nonce: "abc" } },
    } as unknown as Request;

    expect(consumeConnectState(req)).toBeUndefined();
  });

  it("throws when there is no session to save state into", () => {
    const req = { session: null } as unknown as Request;

    expect(() =>
      setConnectState(req, { teamId: 1, teamSlug: "lambeth", nonce: "abc" }),
    ).toThrow();
  });

  it("returns undefined, without throwing, when consuming state from a request with no session", () => {
    const req = { session: null } as unknown as Request;

    expect(consumeConnectState(req)).toBeUndefined();
  });
});

describe("generateNonce", () => {
  it("returns a unique UUID on each call", () => {
    const first = generateNonce();
    const second = generateNonce();

    expect(z.uuid().safeParse(first).success).toBe(true);
    expect(z.uuid().safeParse(second).success).toBe(true);

    expect(first).not.toBe(second);
  });
});

describe("requireStripeConnectTeamAuth", () => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildArgs = (): any => {
    const req = {};
    const res = {
      locals: { parsedReq: { params: { teamSlug: "lambeth" } } },
    };
    const next = vi.fn();
    return { req, res, next };
  };

  beforeEach(() => {
    mockGetTeamBySlug.mockReset();
    mockAssertTeamEditPermission.mockReset();
  });

  it("resolves the team by slug, checks edit permission with it, and stores the team on res.locals", async () => {
    const team = { id: 1, slug: "lambeth" };
    mockGetTeamBySlug.mockResolvedValue(team);
    mockAssertTeamEditPermission.mockResolvedValue(undefined);

    const { req, res, next } = buildArgs();
    await requireStripeConnectTeamAuth(req, res, next);

    expect(mockGetTeamBySlug).toHaveBeenCalledWith("lambeth");
    expect(mockAssertTeamEditPermission).toHaveBeenCalledWith(1, "lambeth");
    expect(res.locals.team).toBe(team);
    expect(next).toHaveBeenCalledWith();
  });

  it("forwards the error when the team cannot be found", async () => {
    mockGetTeamBySlug.mockRejectedValue(
      new ServerError({ status: 404, message: "Team not found: lambeth" }),
    );

    const { req, res, next } = buildArgs();
    await requireStripeConnectTeamAuth(req, res, next);

    expect(mockAssertTeamEditPermission).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });

  it("forwards the error when the user lacks edit permission", async () => {
    mockGetTeamBySlug.mockResolvedValue({ id: 1, slug: "lambeth" });
    mockAssertTeamEditPermission.mockRejectedValue(
      new ServerError({ status: 403, message: "Access denied" }),
    );

    const { req, res, next } = buildArgs();
    await requireStripeConnectTeamAuth(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 403 }));
  });
});

describe("requireNamedStripeAccountsEnabled", () => {
  const lambeth = { id: 1, slug: "lambeth" };
  const adurWorthing = { id: 2, slug: "adur-worthing" };

  type TestTeam = typeof lambeth;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const buildArgs = (team: TestTeam, account?: string): any => {
    const req = {};
    const res = {
      locals: {
        team,
        parsedReq: {
          params: { teamSlug: team.slug },
          query: { account },
        },
      },
    };
    const next = vi.fn();
    return { req, res, next };
  };

  beforeEach(() => {
    mockIsMultipleStripeAccountsEnabled.mockReset();
  });

  it("skips the check for a request without an account name, e.g. from a team with a single account", async () => {
    const { req, res, next } = buildArgs(lambeth);
    await requireNamedStripeAccountsEnabled(req, res, next);

    expect(mockIsMultipleStripeAccountsEnabled).not.toHaveBeenCalled();
    expect(next).toHaveBeenCalledWith();
  });

  it("allows a named account when the team has multiple accounts enabled", async () => {
    mockIsMultipleStripeAccountsEnabled.mockResolvedValue(true);

    const { req, res, next } = buildArgs(adurWorthing, "Worthing");
    await requireNamedStripeAccountsEnabled(req, res, next);

    expect(mockIsMultipleStripeAccountsEnabled).toHaveBeenCalledWith(2);
    expect(next).toHaveBeenCalledWith();
  });

  it("responds with a 404 for a named account when the team doesn't have multiple accounts enabled", async () => {
    mockIsMultipleStripeAccountsEnabled.mockResolvedValue(false);

    const { req, res, next } = buildArgs(adurWorthing, "Worthing");
    await requireNamedStripeAccountsEnabled(req, res, next);

    expect(next).toHaveBeenCalledWith(expect.objectContaining({ status: 404 }));
  });

  it("forwards the error when the setting can't be read", async () => {
    const error = new Error("db down");
    mockIsMultipleStripeAccountsEnabled.mockRejectedValue(error);

    const { req, res, next } = buildArgs(adurWorthing, "Worthing");
    await requireNamedStripeAccountsEnabled(req, res, next);

    expect(next).toHaveBeenCalledWith(error);
  });
});

describe("setPendingOnboarding / getPendingOnboarding / clearPendingOnboarding", () => {
  it("returns the pending account for the same team", () => {
    const req = buildRequest();
    setPendingOnboarding(req, { teamId: 1, accountId: "acct_pending" });

    expect(getPendingOnboarding(req, 1)).toEqual({
      teamId: 1,
      accountId: "acct_pending",
    });
  });

  it("can be read repeatedly, so onboarding can be resumed", () => {
    const req = buildRequest();
    setPendingOnboarding(req, { teamId: 1, accountId: "acct_pending" });

    getPendingOnboarding(req, 1);

    expect(getPendingOnboarding(req, 1)?.accountId).toBe("acct_pending");
  });

  it("ignores a pending account belonging to a different team", () => {
    const req = buildRequest();
    setPendingOnboarding(req, { teamId: 1, accountId: "acct_pending" });

    expect(getPendingOnboarding(req, 2)).toBeUndefined();
  });

  it("returns the pending account for the same named account", () => {
    const req = buildRequest();
    setPendingOnboarding(req, {
      teamId: 2,
      accountId: "acct_pending",
      accountName: "Worthing",
    });

    expect(getPendingOnboarding(req, 2, "Worthing")?.accountId).toBe(
      "acct_pending",
    );
  });

  it("ignores a pending account belonging to a different account of the same team", () => {
    const req = buildRequest();
    setPendingOnboarding(req, {
      teamId: 2,
      accountId: "acct_pending",
      accountName: "Worthing",
    });

    expect(getPendingOnboarding(req, 2, "Adur")).toBeUndefined();
    expect(getPendingOnboarding(req, 2)).toBeUndefined();
  });

  it("returns undefined once cleared", () => {
    const req = buildRequest();
    setPendingOnboarding(req, { teamId: 1, accountId: "acct_pending" });

    clearPendingOnboarding(req);

    expect(getPendingOnboarding(req, 1)).toBeUndefined();
  });

  it("throws when there is no session to save state into", () => {
    const req = { session: null } as unknown as Request;

    expect(() =>
      setPendingOnboarding(req, { teamId: 1, accountId: "acct_pending" }),
    ).toThrow();
  });
});
