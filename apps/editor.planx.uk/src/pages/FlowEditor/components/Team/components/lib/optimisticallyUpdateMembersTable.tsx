import { useStore } from "pages/FlowEditor/lib/store";

import {
  AddNewEditorFormValues,
  TeamMember,
  UpdateEditorFormValues,
} from "../../types";

export const optimisticallyAddNewMember = async (
  values: AddNewEditorFormValues,
  userId: number,
) => {
  const existingMembers = useStore.getState().teamMembers;
  const newMember: TeamMember = {
    ...values,
    id: userId,
    defaultTeamId: null,
  };

  await useStore.getState().setTeamMembers([...existingMembers, newMember]);
};

export const optimisticallyUpdateExistingMember = async (
  values: UpdateEditorFormValues,
  userId: number,
) => {
  const existingMembers = useStore.getState().teamMembers;
  const updatedMembers: TeamMember[] = existingMembers.map((member) => {
    if (member.id === userId) {
      return {
        ...values,
        id: userId,
        role: member.role,
        defaultTeamId: member.defaultTeamId,
      };
    }
    return member;
  });
  await useStore.getState().setTeamMembers(updatedMembers);
};
