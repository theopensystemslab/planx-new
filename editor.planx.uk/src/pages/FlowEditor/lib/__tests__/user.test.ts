import { User } from "@opensystemslab/planx-core/types";

import { FullStore, vanillaStore } from "../store";

const { getState, setState } = vanillaStore;
const { canUserEditTeam } = getState();

const redUser: User = {
  id: 1,
  isPlatformAdmin: false,
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
};

const blueUser: User = {
  id: 2,
  isPlatformAdmin: false,
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
};

const readOnlyUser: User = {
  id: 3,
  isPlatformAdmin: false,
  firstName: "Read",
  lastName: "Only",
  email: "readonly@no-team.com",
  teams: [],
};

const adminUser: User = {
  id: 4,
  isPlatformAdmin: true,
  firstName: "Platform",
  lastName: "Admin",
  email: "admin@opensystemslab.io",
  teams: [],
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
