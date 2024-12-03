import type { PutObjectCommandInput } from "@aws-sdk/client-s3";
import { s3Factory } from "./utils.js";

export const getFileFromS3 = async (fileId: string) => {
  const s3 = s3Factory();

  const params: PutObjectCommandInput = {
    Key: fileId,
    Bucket: process.env.AWS_S3_BUCKET,
  };

  const file = await s3.getObject(params);

  if (!file.Body) throw Error(`Missing body from S3 file ${fileId}`);

  const body = Buffer.from(await file.Body.transformToByteArray());

  return {
    body,
    isPrivate: file.Metadata?.is_private === "true",
    headers: {
      "Content-Type": file.ContentType,
      "Content-Length": file.ContentLength,
      "Content-Disposition": file.ContentDisposition,
      "Content-Encoding": file.ContentEncoding,
      "Cache-Control": file.CacheControl,
      Expires: file.ExpiresString,
      "Last-Modified": file.LastModified,
      ETag: file.ETag,
      "cross-origin-resource-policy": "cross-site",
    },
  };
};
