import { updateMetabaseId } from "./updateMetabaseId.js";
import { getTeamIdAndMetabaseId } from "../shared/getTeamIdAndMetabaseId.js";
import { createCollection } from "./createCollection.js";

/**
 * the Metabase collection ID is for the "Council" collection
 * see https://github.com/theopensystemslab/planx-new/pull/4072#discussion_r1892631692
 **/
const COUNCILS_COLLECTION_ID = 78;

export async function createTeamCollection(slug: string): Promise<number> {
  try {
    const { metabaseId, name, id: teamId } = await getTeamIdAndMetabaseId(slug);

    if (metabaseId) {
      return metabaseId;
    }

    const newMetabaseId = await createCollection({
      name,
      parentId: COUNCILS_COLLECTION_ID,
    });

    await updateMetabaseId(teamId, newMetabaseId);
    return newMetabaseId;
  } catch (error) {
    console.error("Error in createTeamCollection:", error);
    throw error;
  }
}
