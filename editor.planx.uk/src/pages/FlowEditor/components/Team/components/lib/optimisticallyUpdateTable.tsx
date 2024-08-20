import { getRandomNumberInRange } from "@planx/components/shared/utils";
import { useStore } from "pages/FlowEditor/lib/store";

import { AddNewEditorFormValues, TeamMember } from "../../types";

export const optimisticallyUpdateTable = async (
  values: AddNewEditorFormValues,
) => {
  const randomNumber = getRandomNumberInRange(1000, 2000); // each table row needs a unique numerical key so randomise for now
  const newMember: TeamMember = {
    ...values,
    role: "teamEditor",
    id: randomNumber,
  };

  await useStore.getState().setTeamMembers([newMember]);
};
