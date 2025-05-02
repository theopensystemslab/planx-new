import { filterPublicLink } from "./filterPublicLink.js";
import { updatePublicAnalyticsLink } from "./updatePublicAnalyticsLink.js";
import type { CreateNewDashboardLinkParams } from "./types.js";
import { ServerError } from "../../../errors/serverError.js";
import { findDashboardPublicLink } from "./findDashboardPublicLink.js";
import { getTeamSlug } from "./getTeamSlug.js";

/**
 * @returns The dashboard name (the Metabase API performs GETs with the dashboard ID, so we have to have that locally already--no need to return it here)
 */
export async function createNewDashboardLink({
  status,
  flowId,
  teamId,
  serviceSlug,
}: CreateNewDashboardLinkParams): Promise<string | undefined> {
  if ( status !== "online" ) {
    return;
  }

  try {
    console.log("trying to createNewDashboardLink")
    const { teamSlug } = await getTeamSlug(teamId);
    const dashboardPublicLink = findDashboardPublicLink(serviceSlug);

    if (!dashboardPublicLink) return;

    const filteredLink = await filterPublicLink(
      dashboardPublicLink,
      serviceSlug,
      teamSlug,
    );

    await updatePublicAnalyticsLink(flowId, filteredLink);
    return;
  } catch (error) {
    throw new ServerError({
      message: `Error in createNewDashboardLink: ${error}`,
      cause: error,
    });
  }
}
