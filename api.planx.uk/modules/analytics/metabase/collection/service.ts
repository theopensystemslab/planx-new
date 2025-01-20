import { updateMetabaseId } from "./updateMetabaseId.js";
import type { NewCollectionParams } from "./types.js";
import { getTeamIdAndMetabaseId } from "./getTeamIdAndMetabaseId.js";
import { createCollection } from "./createCollection.js";

/**
 * The `getTeamIdAndMetabaseId()` function is run here to first get teams.id and .metabase_id from PlanX db, if present,
 * so that the service can figure out if it needs to run `createCollection()` or not.
 * Instead of running `getTeamIdAndMetabaseId()` first in the controller, it is encapsulated in `createTeamCollection` to keep business logic in `service.ts` instead of `controller.ts`.
 */
export async function createTeamCollection({
  slug,
  parentId,
  description,
}: NewCollectionParams): Promise<number> {
  try {
    const { metabaseId, name, id: teamId } = await getTeamIdAndMetabaseId(slug);

    if (metabaseId) {
      return metabaseId;
    }

    const newMetabaseId = await createCollection({
      name,
      parentId,
      description,
    });

    await updateMetabaseId(teamId, newMetabaseId);
    return newMetabaseId;
  } catch (error) {
    console.error("Error in createTeamCollection:", error);
    throw error;
  }
}
