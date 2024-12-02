import { MetabaseError, metabaseClient } from "../shared/client.js";
import type { NewCollectionParams } from "./types.js";
import { toSnakeCase } from "../shared/utils.js";

export async function authentication(): Promise<boolean> {
  try {
    const response = await metabaseClient.get("/user/current");
    return response.status === 200;
  } catch (error) {
    console.error("Error testing Metabase connection:", error);
    return false;
  }
}

export async function newCollection({
  name,
  description,
  parent_id,
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
      parent_id,
    });

    // Remove undefined properties
    Object.keys(requestBody).forEach(
      (key) => requestBody[key] === undefined && delete requestBody[key],
    );

    const response = await metabaseClient.post(`/api/collection/`, {
      name,
      description,
      parent_id,
    });
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
    const response = await metabaseClient.get(`/api/collection/`);

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
