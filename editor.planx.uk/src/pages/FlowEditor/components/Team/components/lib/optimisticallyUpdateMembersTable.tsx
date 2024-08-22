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

  await useStore.getState().setTeamMembers([newMember]);
};
