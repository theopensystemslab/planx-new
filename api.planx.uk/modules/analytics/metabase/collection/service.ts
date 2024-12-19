import { updateMetabaseId } from "./updateMetabaseId.js";
import type { NewCollectionParams, MetabaseCollectionParams } from "./types.js";
import { getTeamIdAndMetabaseId } from "./getTeamIdAndMetabaseId.js";
import { createCollection } from "./createCollection.js";

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
