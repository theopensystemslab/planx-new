import { Role, User } from "@opensystemslab/planx-core/types";
import React, { SetStateAction } from "react";

export type TeamMember = Omit<User, "teams" | "isPlatformAdmin"> & {
  role: Role;
};

export interface MembersTableProps {
  members: TeamMember[];
  showAddMemberButton?: boolean;
}
export interface AddNewEditorModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<SetStateAction<boolean>>;
}
export interface UpdateEditorModalProps {
  showUpdateModal: boolean;
  setShowUpdateModal: React.Dispatch<SetStateAction<boolean>>;
  initialValues: AddNewEditorFormValues;
  userId: number;
}
export interface EditorModalProps {
  showModal: boolean;
  setShowModal: React.Dispatch<SetStateAction<boolean>>;
  initialValues: TeamMember;
  userId?: number;
  actionType: "add" | "edit";
}

export interface AddNewEditorFormValues {
  email: string;
  firstName: string;
  lastName: string;
}

export interface EditorFormValues {
  email: string;
  firstName: string;
  lastName: string;
  id?: number;
}
