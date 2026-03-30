import type { Role, User } from "@opensystemslab/planx-core/types";

import { TeamMember } from "./types";

export const hasEmailPresent = (member: TeamMember) => !!member.email;

export const filterByEmailPresent = (members: TeamMember[]): TeamMember[] => {
  return members.filter(hasEmailPresent);
};

const getRole = (user: User): Role => {
  if (user.isPlatformAdmin) return "platformAdmin";
  if (user.isAnalyst) return "analyst";

  return user.teams[0].role;
}

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