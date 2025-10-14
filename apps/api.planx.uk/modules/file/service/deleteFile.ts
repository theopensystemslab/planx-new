import type { DeleteObjectsCommandInput } from "@aws-sdk/client-s3";
import { getS3KeyFromURL, s3Factory } from "./utils.js";

export const deleteFilesByURL = async (
  fileURLs: string[],
): Promise<string[]> => {
  const keys = fileURLs.map(getS3KeyFromURL);
  const result = await deleteFilesByKey(keys);
  return result;
};

export const deleteFilesByKey = async (keys: string[]): Promise<string[]> => {
  const s3 = s3Factory();
  const params = getDeleteFilesParams(keys);
  try {
    await s3.deleteObjects(params);
    return keys;
  } catch (error) {
    throw Error(`Failed to delete S3 files: ${error}`);
  }
};

const getDeleteFilesParams = (keys: string[]): DeleteObjectsCommandInput => ({
  Bucket: process.env.AWS_S3_BUCKET!,
  Delete: {
    Objects: keys.map((key) => ({ Key: key })),
  },
});
