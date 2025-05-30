import { updatePublicAnalyticsLink } from "./updatePublicAnalyticsLink.js";
import type { CreateNewDashboardLinkParams } from "./types.js";
import { ServerError } from "../../../errors/serverError.js";
import { generateDashboardLink } from "./generateDashboardLink.js";
import { getTeamSlug } from "./getTeamSlug.js";

/**
 * @returns The dashboard name (the Metabase API performs GETs with the dashboard ID, so we have to have that locally already--no need to return it here)
 */
export async function createNewDashboardLink({
  analyticsLink,
  status,
  flowId,
  serviceSlug,
}: CreateNewDashboardLinkParams): Promise<string | undefined> {
  if (status !== "online" || analyticsLink !== null) return;

  const environment =
    process.env.APP_ENVIRONMENT === "production" ? "production" : "staging";

  try {
    const dashboardPublicLink = generateDashboardLink({
      environment,
      serviceSlug,
      flowId,
    });
    if (!dashboardPublicLink) return;

    await updatePublicAnalyticsLink(flowId, dashboardPublicLink);
    return;
  } catch (error) {
    throw new ServerError({
      message: `Error in createNewDashboardLink: ${error}`,
      cause: error,
    });
  }
}
