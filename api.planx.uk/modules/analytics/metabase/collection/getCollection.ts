import type { GetCollectionResponse } from "./types.js";
import { $metabase } from "../shared/client.js";

/**
 * Retrieves info on a collection from Metabase, use to check a parent. Currently only used in tests but could be useful for other Metabase functionality
 */
export async function getCollection(
  id: number,
): Promise<GetCollectionResponse> {
  const response = await $metabase.get(`/api/collection/${id}`);

  const transformedCollection = {
    name: response.data.name,
    id: response.data.id,
    description: response.data.description,
    slug: response.data.slug,
    parentId: response.data.parentId,
  };

  return transformedCollection;
}
