import { createMetabaseClient } from "../shared/client.js";
import type { GetCollectionResponse } from "./types.js";

const client = createMetabaseClient();
/**
 * Retrieves info on a collection from Metabase, use to check a parent. Currently only used in tests but could be useful for other Metabase functionality
 * @param id
 * @returns
 */
export async function getCollection(
  id: number,
): Promise<GetCollectionResponse> {
  const response = await client.get(`/api/collection/${id}`);
  return response.data;
}
