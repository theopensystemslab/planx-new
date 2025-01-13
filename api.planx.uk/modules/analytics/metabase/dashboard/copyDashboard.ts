import type { CopyDashboardParams } from "./types.js";
import { $metabase } from "../shared/client.js";

/** Returns the ID of the copied dashboard. */
export async function copyDashboard(
  params: CopyDashboardParams,
): Promise<number> {
  const response = await $metabase.post(
    `/api/dashboard/${params.templateId}/copy`,
    params,
  );
  return response.data.id;
}
