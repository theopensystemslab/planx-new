import type { User } from "@opensystemslab/planx-core/types";
import { mockUserWithRole } from "test/mockUser";

import type { FullStore } from "../store";
import { useStore } from "../store";
import { getUserRoleForTeam } from "../store/user";

const { getState, setState } = useStore;
const { canUserEditTeam } = getState();

const redUser: User = {
  id: 1,
  isPlatformAdmin: false,
  isAnalyst: false,
  firstName: "Red",
  lastName: "Reddison",
  email: "red@red-team.com",
  teams: [
    {
      role: "teamEditor",
      team: {
        name: "Red Team",
        slug: "red-team",
        id: 1,
      },
    },
    {
      role: "teamViewer",
      team: {
        name: "Blue Team",
        slug: "blue-team",
        id: 1,
      },
    },
  ],
  defaultTeamId: null,
};

const blueUser: User = {
  id: 2,
  isPlatformAdmin: false,
  isAnalyst: false,
  firstName: "Blue",
  lastName: "Bluey",
  email: "blue@blue-team.com",
  teams: [
    {
      role: "teamEditor",
      team: {
        name: "Blue Team",
        slug: "blue-team",
        id: 1,
      },
    },
  ],
  defaultTeamId: null,
};

const readOnlyUser: User = {
  id: 3,
  isPlatformAdmin: false,
  isAnalyst: false,
  firstName: "Read",
  lastName: "Only",
  email: "readonly@no-team.com",
  teams: [],
  defaultTeamId: null,
};

const adminUser: User = {
  id: 4,
  isPlatformAdmin: true,
  isAnalyst: false,
  firstName: "Platform",
  lastName: "Admin",
  email: "admin@opensystemslab.io",
  teams: [],
  defaultTeamId: null,
};

let initialState: FullStore;

beforeEach(() => {
  initialState = getState();
});

afterEach(() => setState(initialState));

describe("canUserEditTeam helper function", () => {
  it("returns true when a user has teamEditor permission for a team", () => {
    setState({ user: redUser });
    expect(canUserEditTeam("red-team")).toBe(true);
    expect(canUserEditTeam("blue-team")).toBe(false);
  });

  it("returns false when a user does not have permission for a team", () => {
    setState({ user: blueUser });
    expect(canUserEditTeam("red-team")).toBe(false);
  });

  it("returns false when a user does not have any permissions", () => {
    setState({ user: readOnlyUser });
    expect(canUserEditTeam("red-team")).toBe(false);
    expect(canUserEditTeam("blue-team")).toBe(false);
  });

  it("returns true when a user is has the platformAdmin role", () => {
    setState({ user: adminUser });
    expect(canUserEditTeam("red-team")).toBe(true);
    expect(canUserEditTeam("blue-team")).toBe(true);
  });
});

describe("getUserRoleForTeam", () => {
  it("returns undefined without a user", () => {
    expect(getUserRoleForTeam(null, "test-team")).toBeUndefined();
  });

  it("returns global roles regardless of team", () => {
    expect(
      getUserRoleForTeam(mockUserWithRole("platformAdmin"), undefined),
    ).toBe("platformAdmin");
    expect(getUserRoleForTeam(mockUserWithRole("analyst"), undefined)).toBe(
      "analyst",
    );
  });

  it("returns undefined for team members without a team", () => {
    expect(
      getUserRoleForTeam(mockUserWithRole("teamEditor"), undefined),
    ).toBeUndefined();
  });

  it("returns the user's role for the given team", () => {
    const user = mockUserWithRole("teamEditor", "test-team");
    expect(getUserRoleForTeam(user, "test-team")).toBe("teamEditor");
  });

  it("returns teamViewer for a team the user isn't a member of", () => {
    const user = mockUserWithRole("teamAdmin", "test-team");
    expect(getUserRoleForTeam(user, "other-team")).toBe("teamViewer");
  });

  it("prefers teamAdmin when the user holds multiple roles for a team", () => {
    const team = { id: 1, name: "Test team", slug: "test-team" };
    const user: User = {
      ...mockUserWithRole("teamEditor"),
      teams: [
        { role: "teamEditor", team },
        { role: "teamAdmin", team },
      ],
    };

    expect(getUserRoleForTeam(user, "test-team")).toBe("teamAdmin");
  });
});
