import { copyDashboard } from "./copyDashboard.js";
import { getDashboard } from "./getDashboard.js";
import { updateFilter } from "./updateFilter.js";
import { generatePublicLink } from "./generatePublicLink.js";
import { updatePublicAnalyticsLink } from "./updatePublicAnalyticsLink.js";
import type { CreateNewDashboardParams } from "./types.js";
import { ServerError } from "../../../../errors/serverError.js";
import { findDashboardTemplate } from "./findDashboardTemplate.js";

/**
 * @returns The dashboard name (the Metabase API performs GETs with the dashboard ID, so we have to have that locally already--no need to return it here)
 */
export async function createNewDashboard({
  flowId,
  teamName,
  slug,
  description,
  collectionId,
  filter,
  value,
}: CreateNewDashboardParams): Promise<string | undefined> {
  try {
    const templateId = findDashboardTemplate(slug);

    if (typeof templateId === "number") {
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
        filter,
        value,
      });

      const publicLink = await generatePublicLink(copiedDashboardId);
      await updatePublicAnalyticsLink(flowId, publicLink);
    }
    return;
  } catch (error) {
    throw new ServerError({
      message: `Error in createNewDashboard: ${error}`,
      cause: error,
    });
  }
}
