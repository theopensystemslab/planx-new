import { $metabase } from "../shared/client.js";

/** Takes dashboard ID and returns dashboard with name as param; it's useful to return `response.data` to access other properties in testing. */
export async function getDashboard(dashboardId: number): Promise<any> {
  try {
    const response = await $metabase.get(`/api/dashboard/${dashboardId}`);
    return response.data;
  } catch (error) {
    console.error("Error in getDashboard:", error);
    throw error;
  }
}
