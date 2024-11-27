import type { DeleteObjectsCommandInput } from "@aws-sdk/client-s3";
import type { DeleteObjectsRequest } from "aws-sdk/clients/s3.js";
import { getS3KeyFromURL, s3Factory } from "./utils.js";

export const deleteFilesByURL = async (
  fileURLs: string[],
): Promise<string[]> => {
  const keys = fileURLs.map(getS3KeyFromURL);
  return await deleteFilesByKey(keys);
};

export const deleteFilesByKey = async (keys: string[]): Promise<string[]> => {
  const s3 = s3Factory();
  const params = getDeleteFilesParams(keys) as DeleteObjectsCommandInput;
  try {
    s3.deleteObjects(params);
    return keys;
  } catch (error) {
    throw Error(`Failed to delete S3 files: ${error}`);
  }
};

const getDeleteFilesParams = (keys: string[]): DeleteObjectsRequest => ({
  Bucket: process.env.AWS_S3_BUCKET!,
  Delete: {
    Objects: keys.map((key) => ({ Key: key })),
  },
});
