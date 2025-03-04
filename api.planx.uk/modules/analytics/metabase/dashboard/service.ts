import { getTeamNameAndSlug } from "./getTeamNameAndSlug.js";
import { getTeamIdAndMetabaseId } from "../shared/getTeamIdAndMetabaseId.js";
import { copyDashboard } from "./copyDashboard.js";
import { getDashboard } from "./getDashboard.js";
import { generatePublicLinkWithFilters } from "./generatePublicLinkWithFilters.js";
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
  serviceSlug,
}: CreateNewDashboardParams): Promise<string | undefined> {
  try {
    const { teamName, teamSlug } = await getTeamNameAndSlug(teamId);
    const templateId = await findDashboardTemplate(serviceSlug);

    if (!templateId) return;

    const template = await getDashboard(templateId);
    const newName = template.name.replace("Template", teamName);
    const teamData = await getTeamIdAndMetabaseId(teamSlug);
    if (!teamData.metabaseId) {
      throw new Error(`No Metabase ID found for team ${teamSlug}`);
    }
    const collectionId = teamData.metabaseId;

    const copiedDashboardId = await copyDashboard({
      name: newName,
      templateId,
      collectionId,
    });

    const publicLink = await generatePublicLinkWithFilters(
      copiedDashboardId,
      serviceSlug,
      teamSlug,
    );

    await updatePublicAnalyticsLink(flowId, publicLink);
    return;
  } catch (error) {
    throw new ServerError({
      message: `Error in createNewDashboard: ${error}`,
      cause: error,
    });
  }
}
