import type {
  CreateCollectionParams,
  MetabaseCreateCollectionParams,
} from "./types.js";
import { $metabase } from "../shared/client.js";

export async function createCollection(
  params: CreateCollectionParams,
): Promise<number> {
  const metabaseCreateCollectionParams: MetabaseCreateCollectionParams = {
    name: params.name,
    description: params.description,
    parent_id: params.parentId,
  };

  const response = await $metabase.post(
    `/api/collection/`,
    metabaseCreateCollectionParams,
  );
  return response.data.id;
}
