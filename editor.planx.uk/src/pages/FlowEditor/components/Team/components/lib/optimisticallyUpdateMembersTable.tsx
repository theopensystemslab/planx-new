import { useStore } from "pages/FlowEditor/lib/store";

import { AddNewEditorFormValues, TeamMember } from "../../types";

export const optimisticallyUpdateMembersTable = async (
  values: AddNewEditorFormValues,
  userId: number,
) => {
  const newMember: TeamMember = {
    ...values,
    role: "teamEditor",
    id: userId,
  };

  const existingMembers = useStore.getState().teamMembers;

  await useStore.getState().setTeamMembers([...existingMembers, newMember]);
};
