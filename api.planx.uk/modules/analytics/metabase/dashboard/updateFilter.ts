import { $metabase } from "../shared/client.js";
import type { UpdateFilterParams, UpdateFilterResponse } from "./types.js";

/** Takes the ID of the dashboard to be updated, the name of the filter (a string, must be an exact match), and the new value to be filtered on.
 * Currently only works for strings. */
export async function updateFilter(
  params: UpdateFilterParams,
): Promise<UpdateFilterResponse> {
  // Get existing dashboard data
  const response = await $metabase.get(`/api/dashboard/${params.dashboardId}`);

  // Update filter default value parameter
  let updatedFilter;
  const updatedParameters = response.data.parameters.map((param: any) => {
    if (param.name === params.filter) {
      // Check if the filter is a string type
      if (!param.type.startsWith("string/")) {
        throw new Error(
          `Filter type '${param.type}' is not supported. Only string filters are currently supported.`,
        );
      }
      updatedFilter = param.name;
      return { ...param, default: [params.value] };
    }
    return param;
  });

  if (!updatedFilter) {
    throw new Error(
      `Filter "${params.filter}" not found in dashboard parameters`,
    );
  }

  // Prepare the update payload
  const updatePayload = {
    parameters: updatedParameters,
  };

  // Send the updated data back using PUT
  await $metabase.put(`/api/dashboard/${params.dashboardId}`, updatePayload);

  return {
    success: true,
    updatedFilter,
  };
}
