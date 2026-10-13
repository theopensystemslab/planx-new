import type { Role, TeamRole, User } from "@opensystemslab/planx-core/types";

const TEAM_ROLES: Role[] = ["teamAdmin", "teamEditor", "teamViewer"];

const isTeamRole = (role: Role): role is TeamRole => TEAM_ROLES.includes(role);

/**
 * Build a user who holds the given role for a team
 * Pair with a route param (e.g. `{ team: teamSlug }`) for components which read the current team's role
 */
export const mockUserWithRole = (role: Role, teamSlug = "test-team"): User => ({
  id: 1,
  firstName: "Test",
  lastName: "User",
  email: "test@example.com",
  isPlatformAdmin: role === "platformAdmin",
  isAnalyst: role === "analyst",
  defaultTeamId: null,
  teams: isTeamRole(role)
    ? [{ role, team: { id: 1, name: "Test team", slug: teamSlug } }]
    : [],
});
