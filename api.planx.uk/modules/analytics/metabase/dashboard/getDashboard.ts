import { $metabase } from "../shared/client.js";
import type { GetDashboardResponse } from "./types.js";
import { ServerError } from "../../../../errors/serverError.js";

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
