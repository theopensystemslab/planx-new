import { $metabase } from "../shared/client.js";
import type {
  UpdateFilterParams,
  UpdateFilterResponse,
  FilterParam,
  UpdatedFilterResponse,
  GetFilterResponse,
} from "./types.js";
import { getDashboard } from "./getDashboard.js";

function populateUpdatedFilterResponse(
  param: FilterParam,
  filterName: string,
  filterValue: string,
): UpdatedFilterResponse {
  if (param.name === filterName) {
    if (!param.type.startsWith("string/")) {
      throw new Error(
        `Filter type '${param.type}' is not supported. Only string filters are currently supported.`,
      );
    }
    return {
      parameter: { ...param, value: [filterValue] },
      updatedValue: param.name,
    };
  }
  return {
    parameter: param,
    updatedValue: undefined,
  };
}

/** Takes the ID of the dashboard to be updated, the name of the filter (a string, must be an exact match), and the new value to be filtered on.
 * Currently only works for strings. */
export async function updateFilter(
  params: UpdateFilterParams,
): Promise<UpdateFilterResponse> {
  // Get existing dashboard data
  const response = await getDashboard(params.dashboardId);

  // Update filter default value parameter
  let updatedFilter: string | undefined;
  const updatedParameters = response.parameters.map((param) => {
    const result = populateUpdatedFilterResponse(
      param,
      params.filter,
      params.value,
    );

    if (result.updatedValue) {
      updatedFilter = result.updatedValue;
    }
    return result.parameter;
  });
  console.log({ updatedParameters });

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
