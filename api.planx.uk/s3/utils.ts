import S3 from "aws-sdk/clients/s3";
import { isLiveEnv } from "../helpers";

export function s3Factory() {
  return new S3({
    params: { Bucket: process.env.AWS_S3_BUCKET },
    region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    ...useMinio(),
  });
}

function useMinio() {
  if (isLiveEnv()) {
    // Points to AWS
    return {};
  } else {
    // Points to Minio
    return {
      endpoint: "http://127.0.0.1:9000",
      s3ForcePathStyle: true,
      signatureVersion: "v4",
    };
  }
}

export function buildFilePath(
  fileKey: string,
  fileName: string
): string | null {
  if (!fileKey || !fileName) {
    return null;
  }

  return `${fileKey}/${fileName}`;
}
