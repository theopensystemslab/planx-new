import { Role, User } from "@opensystemslab/planx-core/types";
import React, { SetStateAction } from "react";

export type TeamMember = Omit<User, "teams" | "isPlatformAdmin" | "email"> & {
  role: Role;
  email: string | null;
};

export interface MembersTableProps {
  members: TeamMember[];
  showAddMemberButton?: boolean;
  showEditMemberButton?: boolean;
  showRemoveMemberButton?: boolean;
}
export interface AddNewEditorModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<SetStateAction<boolean>>;
}
export interface AddNewEditorFormValues {
  email: string | null;
  firstName: string;
  lastName: string;
}

export type ActionType = "add" | "edit" | "remove";

export interface EditorModalProps {
  showModal?: boolean;
  setShowModal: React.Dispatch<SetStateAction<boolean>>;
  initialValues?: TeamMember;
  userId?: number;
  actionType?: ActionType;
}
