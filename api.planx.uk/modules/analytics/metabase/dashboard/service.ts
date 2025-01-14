import { copyDashboard } from "./copyDashboard.js";
import { getDashboard } from "./getDashboard.js";
import { updateFilter } from "./updateFilter.js";
import { generatePublicLink } from "./generatePublicLink.js";
import type { CreateNewDashboardParams } from "./types.js";

/**
 * @returns The dashboard name (the Metabase API performs GETs with the dashboard ID, so we have to have that locally already--no need to return it here)
 */
export async function createNewDashboard(
  params: CreateNewDashboardParams,
): Promise<string> {
  try {
    const templateName = await getDashboard(params.templateId);
    const newName = templateName.replace("Template", params.teamName);
    const copiedDashboardId = await copyDashboard({
      name: newName,
      templateId: params.templateId,
      description: params.description,
      collectionId: params.collectionId,
      collectionPosition: params.collectionPosition,
      isDeepCopy: false,
    });

    // updateFilter() does not need to be saved to a variable because we don't need to access its output anywhere else
    await updateFilter({
      dashboardId: copiedDashboardId,
      filter: params.filter,
      value: params.value,
    });
    const publicLink = await generatePublicLink(copiedDashboardId);
    return publicLink;
  } catch (error) {
    console.error("Error in createNewDashboard:", error);
    throw error;
  }
}
