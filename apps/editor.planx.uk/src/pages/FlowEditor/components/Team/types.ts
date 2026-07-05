import type { Role, TeamRole, User } from "@opensystemslab/planx-core/types";

export const ROLE_LABELS = {
  platformAdmin: "Platform admin",
  teamAdmin: "Team admin",
  teamEditor: "Team editor",
  teamViewer: "Team viewer",
  public: "Public",
  analyst: "Analyst",
} as const;

export type TeamMember = ActiveTeamMember | ArchivedTeamMember;

type ArchivedTeamMember = Omit<
  User,
  "teams" | "isPlatformAdmin" | "email" | "isAnalyst"
> & {
  role: Role;
  email: string | null;
};

type ActiveTeamMember = Omit<User, "teams"> & {
  role: Role;
};

export interface MembersTableProps {
  members: TeamMember[];
  showAddMemberButton?: boolean;
  showEditMemberButton?: boolean;
  showRemoveMemberButton?: boolean;
  showTeamAdminSwitch?: boolean;
  userRole: Role;
}

export interface UserFormValues {
  email: string;
  firstName: string;
  lastName: string;
  role: TeamRole;
}

export type ModalState =
  | { action: "closed" }
  | { action: "add" }
  | { action: "edit"; member: TeamMember }
  | { action: "remove"; member: TeamMember }
  | { action: "attemptedAdd" };

type SharedModalProps = {
  onClose: () => void;
  userRole: Role;
};

export type AddUserModalProps = SharedModalProps;
export type EditUserModalProps = SharedModalProps & { member: TeamMember };
export type RemoveUserModalProps = SharedModalProps & { member: TeamMember };
