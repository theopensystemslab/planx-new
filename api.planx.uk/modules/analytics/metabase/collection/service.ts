import { MetabaseError, createMetabaseClient } from "../shared/client.js";
import { updateMetabaseId } from "./updateMetabaseId.js";
import type { NewCollectionParams } from "./types.js";

const client = createMetabaseClient();

/**
 * First checks if a collection with a specified name exists.
 * If it exists, return an object that includes its id. If not, create the collection.
 * @params `name` is required, but `description` and `parent_id` are optional.
 * @returns `response.data`, so use dot notation to access `id` or `parent_id`.
 */
export async function newCollection(params: NewCollectionParams): Promise<any> {
  try {
    // Check if collection exists
    const existingCollectionId = await checkCollections(params.name);
    if (existingCollectionId) {
      console.log(
        `Collection "${params.name}" already exists with ID: ${existingCollectionId}`,
      );
      await updateMetabaseId(1, existingCollectionId); // TODO: remove hard-coded team id
      return existingCollectionId;
    }

    console.log({ params });

    const transformedParams = {
      name: params.name,
      parent_id: params.parentId,
    };

    const response = await client.post(`/api/collection/`, transformedParams);

    console.log(
      `New collection: ${response.data.name}, new collection ID: ${response.data.id}`,
    );
    await updateMetabaseId(1, response.data.id); // TODO: remove hard-coded team id
    return response.data.id;
  } catch (error) {
    console.error("Error in newCollection:", error);
    throw error;
  }
}

/**
 * Checks if a collection exists with name matching `teamName` exists.
 * Returns the matching collection ID if exists, otherwise false. */
export async function checkCollections(teamName: string): Promise<any> {
  try {
    console.log("Checking for collection: ", teamName);

    // Get collections from Metabase
    const response = await client.get(`/api/collection/`);

    const matchingCollection = response.data.find(
      (collection: any) =>
        collection.name.toLowerCase() === teamName.toLowerCase(),
    );

    if (matchingCollection) {
      console.log("Matching collection found with ID: ", matchingCollection.id);
      return matchingCollection.id;
    } else {
      console.log("No matching collection found");
      return undefined;
    }
  } catch (error) {
    console.error("Error: ", error);
    if (error instanceof MetabaseError) {
      console.error("Metabase API error:", {
        message: error.message,
        statusCode: error.statusCode,
      });
    }
    throw error;
  }
}

/**
 * Retrieves info on a collection from Metabase, use to check a parent
 * @param id
 * @returns
 */
export async function getCollection(id: number): Promise<any> {
  const response = await client.get(`/api/collection/${id}`);
  return response.data;
}
