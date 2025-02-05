import type { MetabaseCollectionParams } from "./types.js";
import { $metabase } from "../shared/client.js";

export async function createCollection(
  params: MetabaseCollectionParams,
): Promise<number> {
  const response = await $metabase.post(`/api/collection/`, { 
    name: params.name,
    parent_id: params.parentId, 
    description: params.description
  } );
  
  return response.data.id;
}
