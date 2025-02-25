import { getTeamNameAndSlug } from "./getTeamNameAndSlug.js";
import { getTeamIdAndMetabaseId } from "../shared/getTeamIdAndMetabaseId.js";
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
  teamId,
  serviceSlug
}: CreateNewDashboardParams): Promise<string | undefined> {
  try {
    const { teamName, teamSlug } = await getTeamNameAndSlug(teamId)
    const templateId = findDashboardTemplate(serviceSlug);

    if (typeof templateId === "number") {
      const template = await getDashboard(templateId);
      const newName = template.name.replace("Template", teamName);
      const collectionId = (await getTeamIdAndMetabaseId(teamSlug)).metabaseId as number;
      
      const copiedDashboardId = await copyDashboard({
        name: newName,
        templateId,
        // description,
        collectionId,
      });

      // all dashboard templates have team-slug and service-slug filters
      await updateFilter({
        dashboardId: copiedDashboardId,
        filter: "Team slug",
        value: teamSlug,
      });

      await updateFilter({
        dashboardId: copiedDashboardId,
        filter: "Service slug",
        value: serviceSlug,
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
