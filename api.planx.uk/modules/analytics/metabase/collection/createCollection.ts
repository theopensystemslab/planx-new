import { createMetabaseClient } from "../shared/client.js";
import type { MetabaseCollectionParams, NewCollectionParams } from "./types.js";

const client = createMetabaseClient();

export async function createCollection(
  params: MetabaseCollectionParams,
): Promise<number> {
  const response = await client.post(`/api/collection/`, params);
  return response.data.id;
}
