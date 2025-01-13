import { $metabase } from "../shared/client.js";

/** Takes dashboard ID and returns dashboard name. */
export async function getDashboard(dashboardId: number): Promise<any> {
  try {
    const response = await $metabase.get(`/api/dashboard/${dashboardId}`);
    console.log("Original dashboard name: ", response.data.name);
    return response.data.name;
  } catch (error) {
    console.error("Error in getDashboard:", error);
    throw error;
  }
}
