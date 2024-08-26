import { TeamMember } from "../../types";

export const hasEmailPresent = (member: TeamMember) => !!member.email;

export const filterByEmailPresent = (members: TeamMember[]): TeamMember[] => {
  return members.filter(hasEmailPresent);
};

export const filterExcludingPlatformAdmins = (
  members: TeamMember[],
): TeamMember[] => {
  return members.filter((member) => member.role !== "platformAdmin");
};
