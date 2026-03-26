import { Role, TeamRole, User } from "@opensystemslab/planx-core/types";

export const ROLE_LABELS = {
  platformAdmin: "Admin",
  teamAdmin: "Team admin",
  teamEditor: "Editor",
  teamViewer: "Viewer",
  demoUser: "Demo User",
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
}

export interface UserFormValues {
  email: string;
  firstName: string;
  lastName: string;
  role: TeamRole;
}

export type ModalState =
  | { action: "closed" }
  | { action: "add"; member?: never }
  | { action: "edit"; member: TeamMember }
  | { action: "remove"; member: TeamMember };

type SharedModalProps = {
  onClose: () => void;
};

export type EditorModalProps = SharedModalProps & ModalState;

export const DEMO_TEAM_ID = 32;