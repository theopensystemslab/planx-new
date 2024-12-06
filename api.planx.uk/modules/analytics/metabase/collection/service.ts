import { MetabaseError, createMetabaseClient } from "../shared/client.js";
import type { NewCollectionParams } from "./types.js";

const client = createMetabaseClient();

export async function newCollection(params: NewCollectionParams): Promise<any> {
  try {
    // Check if collection exists
    const existingCollectionId = await checkCollections(params.name);
    if (existingCollectionId) {
      console.log(
        `Collection "${params.name}" already exists with ID: ${existingCollectionId}`,
      );
      return existingCollectionId;
    }

    const response = await client.post(`/api/collection/`, params);

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
