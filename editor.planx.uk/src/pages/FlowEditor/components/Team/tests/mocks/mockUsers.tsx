import { TeamMember } from "../../types";

export const alreadyExistingUser: TeamMember = {
  firstName: "Mickey",
  lastName: "Mouse",
  email: "mickeymouse@email.com",
  id: 3,
  role: "teamEditor",
};

export const emptyTeamMemberObj: TeamMember = {
  firstName: "",
  lastName: "",
  email: "",
  id: 3,
  role: "teamEditor",
};
