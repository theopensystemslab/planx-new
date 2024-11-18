import { MetabaseError, metabaseClient } from "../shared/client.js";
import type { NewCollectionParams } from "./types.js";
import axios from "axios";

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
  namespace,
  authority_level,
}: NewCollectionParams): Promise<any> {
  try {
    const requestBody: any = {
      name,
      description,
      parent_id,
      namespace,
      authority_level,
    };

    // Remove undefined properties
    Object.keys(requestBody).forEach(
      (key) => requestBody[key] === undefined && delete requestBody[key],
    );

    // console.log('Request body: ', JSON.stringify(requestBody, null, 2));

    const response = await metabaseClient.post(`/api/collection/`, {
      name,
      description,
      parent_id,
      namespace,
      authority_level,
    });
    console.log(
      `New collection: ${response.data.name}, new collection ID: ${response.data.id}`,
    );
    return response.data.id;
  } catch (error) {
    console.error("Error in newCollection:");
    if (axios.isAxiosError(error)) {
      if (error.response) {
        console.error("Response data:", error.response.data);
        console.error("Response status:", error.response.status);
        console.error("Response headers:", error.response.headers);
      } else if (error.request) {
        console.error("No response received. Request:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
      console.error("Request config:", error.config);
    } else {
      console.error("Unexpected error:", error);
    }
    throw error;
  }
}

/** Checks if a collection exists with name matching `teamName` exists.
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
      return false;
    }
  } catch (error) {
    console.error("Error: ", error);
    if (error instanceof MetabaseError) {
      console.error("MetabaseError:", {
        message: error.message,
        statusCode: error.statusCode,
        response: error.response,
      });
    } else if (error instanceof Error) {
      console.error("Unexpected error:", {
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error("Unknown error:", error);
    }
    throw error;
  }
}
