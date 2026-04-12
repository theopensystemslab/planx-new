import type { User } from "@opensystemslab/planx-core/types";

import { TeamMember } from "./types";

export const hasEmailPresent = (member: TeamMember) => !!member.email;

export const userToTeamMember = (user: User): TeamMember => ({
  firstName: user.firstName,
  lastName: user.lastName,
  email: user.email,
  id: user.id,
  role: user.isPlatformAdmin ? "platformAdmin" : user.teams[0].role,
  defaultTeamId: user.defaultTeamId,
});

export const isPlatformAdmin = (member: TeamMember): boolean =>
  member.role === "platformAdmin";