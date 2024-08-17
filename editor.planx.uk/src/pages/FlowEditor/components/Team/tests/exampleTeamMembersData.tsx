import { Role } from "@opensystemslab/planx-core/types";

import { TeamMember } from "../types";

export const exampleTeamMembersData: Record<Role, TeamMember[]> = {
  platformAdmin: [
    {
      firstName: "Donella",
      lastName: "Meadows",
      email: "donella@example.com",
      id: 1,
      role: "platformAdmin",
    },
  ],
  teamEditor: [
    {
      firstName: "Bill",
      lastName: "Sharpe",
      email: "bill@example.com",
      id: 2,
      role: "teamEditor",
    },
  ],
  teamViewer: [],
  public: [],
};
