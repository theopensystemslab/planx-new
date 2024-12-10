import { MetabaseError, createMetabaseClient } from "../shared/client.js";
import { updateMetabaseId } from "./updateMetabaseId.js";
import type { NewCollectionParams } from "./types.js";
import { getTeamAndMetabaseId } from "./getMetabaseId.js";

const client = createMetabaseClient();

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
    console.log({ metabaseId });
    if (metabaseId) {
      await updateMetabaseId(id, metabaseId);
      return metabaseId;
    }
    const transformedParams = {
      name: params.name,
      parent_id: params.parentId,
    };

    const response = await client.post(`/api/collection/`, transformedParams);

    console.log(
      `New collection: ${response.data.name}, new collection ID: ${response.data.id}`,
    );
    await updateMetabaseId(id, response.data.id); // TODO: remove hard-coded team id
    return response.data.id;
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
