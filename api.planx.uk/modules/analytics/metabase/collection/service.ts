import { createMetabaseClient } from "../shared/client.js";
import { updateMetabaseId } from "./updateMetabaseId.js";
import type { NewCollectionParams } from "./types.js";
import { getTeamAndMetabaseId } from "./getTeamAndMetabaseId.js";
import { createCollection } from "./createCollection.js";

const client = createMetabaseClient();

/**
 * First uses name to get teams.id and .metabase_id, if present.
 * If metabase_id is null, return an object that includes its id. If not, create the collection.
 * @params `name` is required, but `description` and `parent_id` are optional.
 * @returns `response.data`, so use dot notation to access `id` or `parent_id`.
 */
export async function checkCollections(
  params: NewCollectionParams,
): Promise<any> {
  try {
    const teamAndMetabaseId = await getTeamAndMetabaseId(params.name);
    const { metabaseId, id } = teamAndMetabaseId;

    if (metabaseId) {
      return metabaseId;
    }

    // Create new Metabase collection if !metabaseId
    const newMetabaseId = await createCollection(params);
    await updateMetabaseId(id, newMetabaseId);
    return newMetabaseId;
  } catch (error) {
    console.error("Error in checkCollections:", error);
    throw error;
  }
}
