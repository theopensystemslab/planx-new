import type { CreateCollectionParams, MetabaseCreateCollectionParams } from "./types.js";
import { $metabase } from "../shared/client.js";

export async function createCollection(
  params: CreateCollectionParams,
): Promise<number> {
  const response = await $metabase.post(`/api/collection/`, { 
    name: params.name,
    parent_id: params.parentId, 
    description: params.description
  } as MetabaseCreateCollectionParams);
  
  return response.data.id;
}
