import type {
  CopyDashboardParams,
  GetDashboardResponse,
  MetabaseCopyDashboardParams,
} from "./types.js";
import { $metabase } from "../shared/client.js";

export async function copyDashboard(
  params: CopyDashboardParams,
): Promise<GetDashboardResponse["id"]> {
  const copyDashboardParams: MetabaseCopyDashboardParams = {
    name: params.name,
    description: params.description,
    collection_id: params.collectionId,
  };
  const response = await $metabase.post(
    `/api/dashboard/${params.templateId}/copy`,
    copyDashboardParams,
  );
  return response.data.id;
}
