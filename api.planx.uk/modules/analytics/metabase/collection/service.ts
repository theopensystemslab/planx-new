import { MetabaseError, createMetabaseClient } from "../shared/client.js";
import { updateMetabaseId } from "./updateMetabaseId.js";
import type { NewCollectionParams } from "./types.js";
import { getTeamAndMetabaseId } from "./getTeamAndMetabaseId.js";

const client = createMetabaseClient();

export async function createCollection(
  params: NewCollectionParams,
): Promise<any> {
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

/**
 * First checks if a collection with a specified name exists.
 * If it exists, return an object that includes its id. If not, create the collection.
 * @params `name` is required, but `description` and `parent_id` are optional.
 * @returns `response.data`, so use dot notation to access `id` or `parent_id`.
 */
export async function newCollection(params: NewCollectionParams): Promise<any> {
  try {
    const teamAndMetabaseId = await getTeamAndMetabaseId(params.name);
    const { metabaseId, id } = teamAndMetabaseId;
    if (metabaseId) {
      console.log("Updating MetabaseId...");
      await updateMetabaseId(id, metabaseId);
      return metabaseId;
    }

    const newMetabaseId = await createCollection(params);
    await updateMetabaseId(id, newMetabaseId);
    return newMetabaseId;
  } catch (error) {
    console.error("Error in newCollection:", error);
    throw error;
  }
}

/**
 * Retrieves info on a collection from Metabase, use to check a parent. Currently only used in tests but could be useful for other Metabase functionality
 * @param id
 * @returns
 */
// TODO: is this more suited to be part of the collection.test.ts?
export async function getCollection(id: number): Promise<any> {
  const response = await client.get(`/api/collection/${id}`);
  return response.data;
}
