import type { Request } from "express";

import { ServerError } from "../../errors/index.js";
import {
  consumeConnectState,
  requireStripeConnectTeamAuth,
  setConnectState,
  verifyState,
} from "./middleware.js";

const mockGetTeamBySlug = vi.fn();
vi.mock("./service.js", () => ({
  getTeamBySlug: (...args: unknown[]) => mockGetTeamBySlug(...args),
}));

const mockAssertTeamEditPermission = vi.fn();
vi.mock("../auth/requireTeamMembership.js", () => ({
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
