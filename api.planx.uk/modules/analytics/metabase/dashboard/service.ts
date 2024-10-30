import { metabaseClient, METABASE_BASE_URL } from "../shared/client.js";
import axios from "axios";
import type { CopyDashboardParams } from "./types.js";

/** Returns the ID of the copied dashboard. */
export async function copyDashboard({
  dashboardId,
  name,
  description,
  collectionId,
  collectionPosition,
  isDeepCopy,
}: CopyDashboardParams): Promise<any> {
  try {
    console.log(`Attempting to copy original dashboard: ${dashboardId}`);
    const requestBody: any = {
      name,
      description,
      collectionId,
      collectionPosition,
      isDeepCopy: isDeepCopy ?? false,
    };

    // Remove undefined properties
    Object.keys(requestBody).forEach(
      (key) => requestBody[key] === undefined && delete requestBody[key],
    );

    // console.log('Request body:', JSON.stringify(requestBody, null, 2));

    const response = await metabaseClient.post(
      `/api/dashboard/${dashboardId}/copy`,
      {
        name,
        description,
        collectionId,
        collectionPosition,
      },
    );
    console.log(
      `New dashboard: ${response.data.dashboardId}, new name: ${response.data.name}`,
    );
    return response.data.dashboardId;
  } catch (error) {
    console.error("Error in copyDashboard:");
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received. Request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      console.error("Request config:", error.config);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}

/** Takes dashboard ID and returns dashboard name. */
export async function getDashboard(dashboardId: number): Promise<any> {
  try {
    const response = await metabaseClient.get(`/api/dashboard/${dashboardId}`);
    console.log("Original dashboard name: ", response.data.name);
    return response.data.name;
  } catch (error) {
    console.error("Error in getDashboard:", error);
    throw error;
  }
}

/** Takes the ID of the dashboard to be updated, the name of the filter (a string, must be an exact match), and the new value to be filtered on.
 * Currently only works for strings. */
export async function updateFilter(
  dashboardId: number,
  filter: string,
  value: string,
): Promise<any> {
  try {
    // Get existing dashboard data
    const response = await metabaseClient.get(`/api/dashboard/${dashboardId}`);

    // Update filter default value parameter
    let updatedParam;
    const updatedParameters = response.data.parameters.map((param: any) => {
      if (param.name === filter) {
        updatedParam = param.name;
        return { ...param, default: [value] };
      }
      return param;
    });

    if (!updatedParam) {
      console.warn(`Filter "${filter}" not found in dashboard parameters`);
    }

    // Prepare the update payload
    const updatePayload = {
      parameters: updatedParameters,
    };

    // Send the updated data back using PUT
    const updatedResponse = await metabaseClient.put(
      `/api/dashboard/${dashboardId}`,
      updatePayload,
    );
    console.log(
      `Updated dashboard ${dashboardId} filter "${updatedParam}" with: ${value}`,
    );
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      console.error("Response:", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}

/** Takes a dashboard ID and returns a public link for it */
export async function generatePublicLink(dashboardId: number): Promise<any> {
  try {
    const response = await metabaseClient.post(
      `/api/dashboard/${dashboardId}/public_link`,
    );
    const url = `${METABASE_BASE_URL}/public/dashboard/${response.data.uuid}`;
    console.log("Public URL : ", url);
    return url;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      console.error("Response:", error.response?.data);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}
