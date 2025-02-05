import type { CopyDashboardParams, GetDashboardResponse } from "./types.js";
import { $metabase } from "../shared/client.js";

export async function copyDashboard(
  params: CopyDashboardParams,
): Promise<GetDashboardResponse["id"]> {
  const response = await $metabase.post(
    `/api/dashboard/${params.templateId}/copy`,
    {
      name: params.name,
      description: params.description,
      collection_id: params.collectionId,
    },
  );
  return response.data.id;
}
