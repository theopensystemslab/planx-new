import { getRandomNumberInRange } from "@planx/components/shared/utils";
import React from "react";

import { AddNewEditorFormValues, TeamMember } from "../../types";

export const optimisticallyUpdateTable = (
  values: AddNewEditorFormValues,
  setTableData: React.Dispatch<React.SetStateAction<TeamMember[]>>,
  tableData: TeamMember[],
) => {
  const randomNumber = getRandomNumberInRange(100, 200); // each table row needs a unique numerical key so randomise for now
  const newMember: TeamMember = {
    ...values,
    role: "teamEditor",
    id: randomNumber,
  };
  setTableData([...tableData, newMember]);
};
