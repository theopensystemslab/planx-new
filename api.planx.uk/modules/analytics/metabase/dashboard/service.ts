import { copyDashboard } from "./copyDashboard.js";
import { getDashboard } from "./getDashboard.js";
import { updateFilter } from "./updateFilter.js";
import { generatePublicLink } from "./generatePublicLink.js";
import type { CreateNewDashboardParams } from "./types.js";
import { ServerError } from "../../../../errors/serverError.js";

/**
 * @returns The dashboard name (the Metabase API performs GETs with the dashboard ID, so we have to have that locally already--no need to return it here)
 */
export async function createNewDashboard({
  teamName,
  templateId,
  description,
  collectionId,
  filter,
  value,
}: CreateNewDashboardParams): Promise<string> {
  try {
    const template = await getDashboard(templateId);
    const newName = template.name.replace("Template", teamName);
    const copiedDashboardId = await copyDashboard({
      name: newName,
      templateId,
      description,
      collectionId,
    });

    await updateFilter({
      dashboardId: copiedDashboardId,
      filter: filter,
      value: value,
    });
    const publicLink = await generatePublicLink(copiedDashboardId);
    return publicLink;
  } catch (error) {
    throw new ServerError({
      message: `Error in createNewDashboard: ${error}`,
      cause: error,
    });
  }
}
