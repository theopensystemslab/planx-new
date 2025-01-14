import { $metabase } from "../shared/client.js";
import type { UpdateFilterParams } from "./types.js";

/** Takes the ID of the dashboard to be updated, the name of the filter (a string, must be an exact match), and the new value to be filtered on.
 * Currently only works for strings. */
export async function updateFilter(params: UpdateFilterParams): Promise<any> {
  // Get existing dashboard data
  const response = await $metabase.get(`/api/dashboard/${params.dashboardId}`);

  // Update filter default value parameter
  let updatedFilter;
  const updatedParameters = response.data.parameters.map((param: any) => {
    if (param.name === params.filter) {
      updatedFilter = param.name;
      return { ...param, default: [params.value] };
    }
    return param;
  });

  if (!updatedFilter) {
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

  const updatedResponseDataParamFields = updatedResponse.data.param_fields;
  console.log({ updatedResponseDataParamFields });
  const updatePayloadParams = updatePayload.parameters;
  console.log({ updatePayloadParams });
  console.log(
    `Updated dashboard ${params.dashboardId} filter "${updatedFilter}" with: ${params.value}`,
  );
}
