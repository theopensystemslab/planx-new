import { $metabase } from "../shared/client.js";
import type { GetDashboardResponse } from "./types.js";
import { ServerError } from "../../../../errors/serverError.js";

export async function getDashboard(
  dashboardId: number,
): Promise<GetDashboardResponse> {
  try {
    const response = await $metabase.get(`/api/dashboard/${dashboardId}`);
    const transformedDashboard = {
      id: response.data.id,
      name: response.data.name,
      collectionId: response.data.collection_id,
      description: response.data.description,
      parameters: response.data.parameters,
    };
    return transformedDashboard;
  } catch (error) {
    throw new ServerError({
      message: `Error in getDashboard: ${error}`,
      cause: error,
    });
  }
}
