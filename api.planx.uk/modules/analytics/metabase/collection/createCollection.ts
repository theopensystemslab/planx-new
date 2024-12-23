import type { MetabaseCollectionParams } from "./types.js";
import { $metabase } from "../shared/client.js";

export async function createCollection(
  params: MetabaseCollectionParams,
): Promise<number> {
  const response = await $metabase.post(`/api/collection/`, params);
  return response.data.id;
}
