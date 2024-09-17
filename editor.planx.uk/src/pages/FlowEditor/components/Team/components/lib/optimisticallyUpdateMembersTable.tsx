import { useStore } from "pages/FlowEditor/lib/store";

import { AddNewEditorFormValues, TeamMember } from "../../types";

export const optimisticallyAddNewMember = async (
  values: AddNewEditorFormValues,
  userId: number,
) => {
  const existingMembers = useStore.getState().teamMembers;
  const newMember: TeamMember = {
    ...values,
    role: "teamEditor",
    id: userId,
  };

  await useStore.getState().setTeamMembers([...existingMembers, newMember]);
};

export const optimisticallyUpdateExistingMember = async (
  values: AddNewEditorFormValues,
  userId: number,
) => {
  const existingMembers = useStore.getState().teamMembers;
  const updatedMembers: TeamMember[] = existingMembers.map((member) => {
    if (member.id === userId) {
      return { ...values, id: userId, role: member.role };
    }
    return member;
  });
  await useStore.getState().setTeamMembers(updatedMembers);
};
