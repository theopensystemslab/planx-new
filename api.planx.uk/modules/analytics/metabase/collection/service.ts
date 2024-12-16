import { updateMetabaseId } from "./updateMetabaseId.js";
import type { NewCollectionParams } from "./types.js";
import { getTeamIdAndMetabaseId } from "./getTeamIdAndMetabaseId.js";
import { createCollection } from "./createCollection.js";

/**
 * First uses name to get teams.id and .metabase_id, if present.
 * If metabase_id is null, return an object that includes its id. If not, create the collection.
 * @params `name` is required, but `description` and `parent_id` are optional.
 * @returns `response.data`, so use dot notation to access `id` or `parent_id`.
 */
export async function createCollectionIfDoesNotExist(
  params: NewCollectionParams,
): Promise<number> {
  try {
    const { metabaseId, id: teamId } = await getTeamIdAndMetabaseId(
      params.name,
    );

    if (metabaseId) {
      return metabaseId;
    }

    // Create new Metabase collection if !metabaseId
    const newMetabaseId = await createCollection(params);
    await updateMetabaseId(teamId, newMetabaseId);
    console.log({ newMetabaseId });
    return newMetabaseId;
  } catch (error) {
    console.error("Error in createCollectionIfDoesNotExist:", error);
    throw error;
  }
}
