import type { CopyDashboardParams, GetDashboardResponse } from "./types.js";
import { $metabase } from "../shared/client.js";
import { toMetabaseParams } from "./types.js";

export async function copyDashboard(
  params: CopyDashboardParams,
): Promise<GetDashboardResponse["id"]> {
  const metabaseParams = toMetabaseParams(params);
  const response = await $metabase.post(
    `/api/dashboard/${params.templateId}/copy`,
    metabaseParams,
  );
  return response.data.id;
}
