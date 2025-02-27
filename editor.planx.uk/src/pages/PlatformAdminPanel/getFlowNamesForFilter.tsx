import { capitalize } from "lodash";
import { AdminPanelData } from "types";

export const getFlowNamesForFilter = (data: AdminPanelData[]) => {
  const flattenedData = data?.flatMap((teamData) => teamData.liveFlows);
  // Sort strings alphabetically, transform to title case and remove trailing spaces
  const processedData = flattenedData
    ?.sort()
    .filter((str) => !str.endsWith(" "))
    .map((str) => capitalize(str.toLowerCase()));

  // remove duplicates
  return [...new Set(processedData)];
};
