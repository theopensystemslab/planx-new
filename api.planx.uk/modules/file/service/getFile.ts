import S3 from "aws-sdk/clients/s3";
import { s3Factory } from "./utils";

export const getFileFromS3 = async (fileId: string) => {
  const s3 = s3Factory();

  const params = {
    Key: fileId,
  } as S3.PutObjectRequest;

  const file = await s3.getObject(params).promise();

  return {
    body: file.Body,
    isPrivate: file.Metadata?.is_private === "true",
    headers: {
      "Content-Type": file.ContentType,
      "Content-Length": file.ContentLength,
      "Content-Disposition": file.ContentDisposition,
      "Content-Encoding": file.ContentEncoding,
      "Cache-Control": file.CacheControl,
      Expires: file.Expires,
      "Last-Modified": file.LastModified,
      ETag: file.ETag,
      "cross-origin-resource-policy": "cross-site",
    },
  };
};
