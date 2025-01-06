import { S3 } from "@aws-sdk/client-s3";
import { isLiveEnv } from "../../../helpers.js";
import { Readable } from "stream";

export function s3Factory() {
  return new S3({
    region: process.env.AWS_S3_REGION!,

    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY!,
      secretAccessKey: process.env.AWS_SECRET_KEY!,
    },

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
      endpoint: `http://minio:${process.env.MINIO_PORT}`,
      s3ForcePathStyle: true,
      signatureVersion: "v4",
    };
  }
}

export function buildFilePath(fileKey: string, fileName: string): string {
  return `${fileKey}/${fileName}`;
}

/**
 * Return an S3 key in the fileKey/fileName format, based on a file's API URL
 */
export function getS3KeyFromURL(fileURL: string): string {
  const [folder, file] = new URL(fileURL).pathname.split("/").slice(-2);
  const key = [folder, file].map(decodeURIComponent).join("/");
  return key;
}

export const convertObjectToMulterJSONFile = (
  data: Record<string, unknown>,
  fileName: string,
): Express.Multer.File => {
  const buffer = Buffer.from(JSON.stringify(data));

  return {
    buffer: buffer,
    originalname: fileName,
    mimetype: "application/json",
    size: buffer.length,
    fieldname: "file",
    encoding: "7bit",
    stream: Readable.from(buffer),
    destination: "",
    filename: "",
    path: "",
  };
};
