import { $metabase } from "../shared/client.js";
import type { UpdateFilterParams } from "./types.js";

/** Takes the ID of the dashboard to be updated, the name of the filter (a string, must be an exact match), and the new value to be filtered on.
 * Currently only works for strings. */
export async function updateFilter(params: UpdateFilterParams): Promise<any> {
  // Get existing dashboard data
  const response = await $metabase.get(`/api/dashboard/${params.dashboardId}`);

  // Update filter default value parameter
  let updatedParam;
  const updatedParameters = response.data.parameters.map((param: any) => {
    if (param.name === param.filter) {
      updatedParam = param.name;
      return { ...param, default: [param.value] };
    }
    return param;
  });

  if (!updatedParam) {
    console.warn(`Filter "${params.filter}" not found in dashboard parameters`);
  }

  // Prepare the update payload
  const updatePayload = {
    parameters: updatedParameters,
  };

  // Send the updated data back using PUT
  const updatedResponse = await $metabase.put(
    `/api/dashboard/${params.dashboardId}`,
    updatePayload,
  );
  console.log(
    `Updated dashboard ${params.dashboardId} filter "${updatedParam}" with: ${params.value}`,
  );
}
