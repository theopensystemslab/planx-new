import { Role, TeamRole, User } from "@opensystemslab/planx-core/types";
import React, { SetStateAction } from "react";

export type TeamMember = ActiveTeamMember | ArchivedTeamMember;

type ArchivedTeamMember = Omit<
  User,
  "teams" | "isPlatformAdmin" | "email" | "isAnalyst"
> & {
  role: Role;
  email: string | null;
};

type ActiveTeamMember = Omit<User, "teams" | "isPlatformAdmin"> & {
  role: Role;
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
  email: string;
  firstName: string;
  lastName: string;
  role: TeamRole;
}

export interface UpdateEditorFormValues {
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
