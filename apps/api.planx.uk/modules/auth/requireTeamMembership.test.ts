import type { NextFunction, Request, Response } from "express";

import { userContext } from "./middleware.js";
import { requireTeamMembership } from "./requireTeamMembership.js";

const mockGetById = vi.fn();
vi.mock("../../client/index.js", () => ({
  $api: { user: { getById: () => mockGetById() } },
}));

const getTeamId = (parsedReq: { body: { teamId: number } }) =>
  parsedReq.body.teamId;

const buildArgs = () => {
  const req = {} as Request;
  const res = {
    locals: { parsedReq: { body: { teamId: 1 } } },
  } as unknown as Response;
  const next = vi.fn() as unknown as NextFunction;
  return { req, res, next };
};

// Run the middleware within a user context, mimicking the JWT auth middleware
const runAsUser = (sub: string | undefined, fn: () => Promise<void>) =>
  userContext.run({ user: { sub } as Express.User }, fn);

const invoke = async (sub: string | undefined) => {
  const { req, res, next } = buildArgs();
  await runAsUser(sub, () => requireTeamMembership(getTeamId)(req, res, next));
  return next;
};

describe("requireTeamMembership middleware", () => {
  beforeEach(() => mockGetById.mockReset());

  it("denies access when there is no user in the request context", async () => {
    const { req, res, next } = buildArgs();
    await requireTeamMembership(getTeamId)(req, res, next);

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        message: expect.stringContaining("userId missing"),
      }),
    );
  });

  it("denies access when the user cannot be found", async () => {
    mockGetById.mockResolvedValue(null);
    const next = await invoke("123");

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        message: expect.stringContaining("unable to find user"),
      }),
    );
  });

  it("allows platformAdmins regardless of team membership", async () => {
    mockGetById.mockResolvedValue({ isPlatformAdmin: true, teams: [] });
    const next = await invoke("123");

    expect(next).toHaveBeenCalledWith();
  });

  it("allows teamEditors of the target team", async () => {
    mockGetById.mockResolvedValue({
      isPlatformAdmin: false,
      teams: [{ team: { id: 1 }, role: "teamEditor" }],
    });
    const next = await invoke("123");

    expect(next).toHaveBeenCalledWith();
  });

  it("allows teamAdmins of the target team", async () => {
    mockGetById.mockResolvedValue({
      isPlatformAdmin: false,
      teams: [{ team: { id: 1 }, role: "teamAdmin" }],
    });
    const next = await invoke("123");

    expect(next).toHaveBeenCalledWith();
  });

  it("denies members of the target team with an insufficient role", async () => {
    mockGetById.mockResolvedValue({
      isPlatformAdmin: false,
      teams: [{ team: { id: 1 }, role: "teamViewer" }],
    });
    const next = await invoke("123");

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        message: expect.stringContaining("not a member"),
      }),
    );
  });

  it("denies users who are not members of the target team", async () => {
    mockGetById.mockResolvedValue({
      isPlatformAdmin: false,
      teams: [{ team: { id: 2 }, role: "teamEditor" }],
    });
    const next = await invoke("123");

    expect(next).toHaveBeenCalledWith(
      expect.objectContaining({
        status: 403,
        message: expect.stringContaining("not a member"),
      }),
    );
  });
});
