import { MetabaseError, createMetabaseClient } from "../shared/client.js";
import type { NewCollectionParams } from "./types.js";
import { toSnakeCase } from "../shared/utils.js";

const client = createMetabaseClient();

export async function authentication(): Promise<boolean> {
  try {
    const response = await client.get("/user/current");
    return response.status === 200;
  } catch (error) {
    console.error("Error testing Metabase connection:", error);
    return false;
  }
}

/**
 * First checks if a collection with a specified name exists.
 * If it exists, return an object that includes its id. If not, create the collection.
 * @params `name` is required, but `description` and `parentId` are optional.
 * @returns `response.data`, so use dot notation to access `id` or `parentId`.
 */
export async function newCollection({
  name,
  description,
  parentId,
}: NewCollectionParams): Promise<any> {
  try {
    // Check if collection exists
    const existingCollectionId = await checkCollections(name);
    if (existingCollectionId) {
      console.log(
        `Collection "${name}" already exists with ID: ${existingCollectionId}`,
      );
      return existingCollectionId;
    }

    // If no existing collection, create new one
    const requestBody = toSnakeCase({
      name,
      description,
      parentId,
    });

    // Remove undefined properties
    Object.keys(requestBody).forEach(
      (key) => requestBody[key] === undefined && delete requestBody[key],
    );

    const response = await client.post(`/api/collection/`, requestBody);

    console.log(
      `New collection: ${response.data.name}, new collection ID: ${response.data.id}`,
    );
    return response.data.id;
  } catch (error) {
    console.error("Error in newCollection:");
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

    const matchingCollection = response.data.find((collection: any) =>
      collection.name.toLowerCase().includes(teamName.toLowerCase()),
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
