import { capitalize } from "lodash";
import { AdminPanelData } from "types";

export const getFlowNamesForFilter = (data: AdminPanelData[]) => {
  const flattenedFlowNames = data.flatMap((teamData) => teamData.liveFlows);
  // Sort strings alphabetically, transform to title case and remove trailing spaces
  const formattedFlowNames = flattenedFlowNames
    .map((name) => capitalize(name?.toLowerCase()?.trim()))
    .sort();

  // Remove duplicates
  return [...new Set(formattedFlowNames)];
};
