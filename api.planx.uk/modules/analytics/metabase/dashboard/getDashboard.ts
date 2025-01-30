import { $metabase } from "../shared/client.js";
import type { GetDashboardResponse } from "./types.js";
import { ServerError } from "../../../../errors/serverError.js";

/** Takes dashboard ID and returns dashboard with name as param; it's useful to return `response.data` to access other properties in testing. */
export async function getDashboard(
  dashboardId: number,
): Promise<GetDashboardResponse> {
  try {
    const response = await $metabase.get(`/api/dashboard/${dashboardId}`);
    return response.data;
  } catch (error) {
    throw new ServerError({
      message: `Error in getDashboard: ${error}`,
      cause: error,
    });
  }
}
