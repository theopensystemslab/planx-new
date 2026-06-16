import type { Role, User } from "@opensystemslab/planx-core/types";

import { TeamMember } from "./types";

export const hasEmailPresent = (member: TeamMember) => !!member.email;

const getRole = (user: User): Role => {
  if (user.isPlatformAdmin) return "platformAdmin";
  if (user.isAnalyst) return "analyst";

  /**
   * teamAdmins have two team_member records per-team: teamEditor _and_ teamAdmin.
   * when we check for 'some' here, this is _within_ the team (ie checking if member x is a teamAdmin of this _specific_ team, not teamAdmin of _any_ team) */
  const isUserTeamAdmin = user.teams.some((user) => user.role === "teamAdmin");
  if (isUserTeamAdmin) return "teamAdmin";

  return user.teams[0].role;
};

export const userToTeamMember = (user: User): TeamMember => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  id: user.id,
  role: getRole(user),
  defaultTeamId: user.defaultTeamId,
});

export const isPlatformAdmin = (member: TeamMember): boolean =>
  member.role === "platformAdmin";
