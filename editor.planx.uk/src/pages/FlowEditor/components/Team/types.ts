import { Role, User } from "@opensystemslab/planx-core/types";

export type TeamMember = Omit<User, "teams" | "isPlatformAdmin"> & {
  role: Role;
};

export interface Props {
  teamMembersByRole: Record<string, TeamMember[]>;
}
