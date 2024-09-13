import { useStore } from "pages/FlowEditor/lib/store";

import { AddNewEditorFormValues, TeamMember } from "../../types";

export const optimisticallyUpdateMembersTable = async (
  values: AddNewEditorFormValues,
  userId: number,
  actionType: "edit" | "add",
) => {
  const existingMembers = useStore.getState().teamMembers;
  switch (actionType) {
    case "add":
      await updateNewMember(values, userId, existingMembers);
      break;
    case "edit":
      await updateExistingMember(values, userId, existingMembers);
      break;
  }
};

const updateNewMember = async (
  values: AddNewEditorFormValues,
  userId: number,
  existingMembers: TeamMember[],
) => {
  const newMember: TeamMember = {
    ...values,
    role: "teamEditor",
    id: userId,
  };

  await useStore.getState().setTeamMembers([...existingMembers, newMember]);
};

const updateExistingMember = async (
  values: AddNewEditorFormValues,
  userId: number,
  existingMembers: TeamMember[],
) => {
  const updatedMembers: TeamMember[] = existingMembers.map((member) => {
    if (member.id === userId) {
      return { ...values, id: userId, role: member.role };
    }
    return member;
  });
  await useStore.getState().setTeamMembers(updatedMembers);
};
