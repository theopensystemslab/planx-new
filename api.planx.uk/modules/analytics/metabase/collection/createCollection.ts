import { createMetabaseClient } from "../shared/client.js";
import type { NewCollectionParams } from "./types.js";

const client = createMetabaseClient();

export async function createCollection(
  params: NewCollectionParams,
): Promise<number> {
  const transformedParams = {
    slug: params.slug,
    parent_id: params.parentId,
  };

  const response = await client.post(`/api/collection/`, transformedParams);
  const slug = response.data.slug;
  console.log(
    `New collection: ${response.data.slug}, new collection ID: ${response.data.id}`,
  );
  return response.data.id;
}
