import { createMetabaseClient } from "../shared/client.js";
import type { NewCollectionParams } from "./types.js";

const client = createMetabaseClient();

export async function createCollection(
  params: NewCollectionParams,
): Promise<number> {
  const transformedParams = {
    name: params.name,
    parent_id: params.parentId,
  };

  const response = await client.post(`/api/collection/`, transformedParams);

  console.log(
    `New collection: ${response.data.name}, new collection ID: ${response.data.id}`,
  );
  return response.data.id;
}
