import { Role, User } from "@opensystemslab/planx-core/types";

export type TeamMember = Omit<User, "teams" | "isPlatformAdmin"> & {
  role: Role;
};

export interface TeamMembersProps {
  teamMembersByRole: Record<string, TeamMember[]>;
}
export interface MembersTableProps {
  members: TeamMember[];
  showAddMemberButton?: boolean;
}
