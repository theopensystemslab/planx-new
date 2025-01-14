import type { CopyDashboardParams } from "./types.js";
import { $metabase } from "../shared/client.js";
import { toMetabaseParams } from "./types.js";

/** Returns the ID of the copied dashboard. */
export async function copyDashboard(
  params: CopyDashboardParams,
): Promise<number> {
  const metabaseParams = toMetabaseParams(params);
  console.log({ metabaseParams });
  const response = await $metabase.post(
    `/api/dashboard/${params.templateId}/copy`,
    metabaseParams,
  );
  return response.data.id;
}
