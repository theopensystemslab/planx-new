import { Role, User } from "@opensystemslab/planx-core/types";
import React, { SetStateAction } from "react";

export type TeamMember = Omit<User, "teams" | "isPlatformAdmin"> & {
  role: Role;
};

export interface TeamMembersProps {
  teamMembersByRole: Record<string, TeamMember[]>;
}
export interface MembersTableProps {
  members: TeamMember[];
  showAddMemberButton?: boolean;
  setShowModal?: React.Dispatch<SetStateAction<boolean>>;
}
export interface AddNewEditorModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<SetStateAction<boolean>>;
}

export interface AddNewEditorFormValues {
  email: string;
  firstName: string;
  lastName: string;
}
