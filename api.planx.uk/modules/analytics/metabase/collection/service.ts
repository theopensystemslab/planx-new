import { updateMetabaseId } from "./updateMetabaseId.js";
import type { NewCollectionParams, MetabaseCollectionParams } from "./types.js";
import { getTeamIdAndMetabaseId } from "./getTeamIdAndMetabaseId.js";
import { createCollection } from "./createCollection.js";

/**
 * The `getTeamIdAndMetabaseId()` function is run here to first get teams.id and .metabase_id from PlanX db, if present,
 * so that the service can figure out if it needs to run `createCollection()` or not.
 * Instead of running `getTeamIdAndMetabaseId()` first in the controller, it is encapsulated in `createTeamCollection` to keep business logic in `service.ts` instead of `controller.ts`.
 * @params `slug` is required, but `description` and `parent_id` are optional.
 * @returns `response.data`, so use dot notation to access `id` or `parent_id`.
 */
export async function createTeamCollection(
  params: NewCollectionParams,
): Promise<number> {
  try {
    const {
      metabaseId,
      name,
      id: teamId,
    } = await getTeamIdAndMetabaseId(params.slug);

    if (metabaseId) {
      return metabaseId;
    }

    const { slug, ...rest } = params;
    const metabaseParams = {
      name,
      ...rest,
    } as const;

    const newMetabaseId = await createCollection(metabaseParams);

    await updateMetabaseId(teamId, newMetabaseId);
    return newMetabaseId;
  } catch (error) {
    console.error("Error in createTeamCollection:", error);
    throw error;
  }
}
