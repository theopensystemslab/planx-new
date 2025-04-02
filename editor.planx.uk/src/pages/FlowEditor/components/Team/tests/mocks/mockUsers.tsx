import { User } from "@opensystemslab/planx-core/types";

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

export const mockPlainUser: User = {
  isPlatformAdmin: false,
  isAnalyst: false,
  firstName: "r",
  lastName: "r",
  email: "r",
  id: 909,
  teams: [
    {
      role: "teamEditor",
      team: {
        name: "planX",
        slug: "planx",
        id: 0,
      },
    },
  ],
};
export const mockPlatformAdminUser: User = {
  ...mockPlainUser,
  isPlatformAdmin: true,
};
