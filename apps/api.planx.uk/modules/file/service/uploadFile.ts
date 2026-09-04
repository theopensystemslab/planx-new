import {
  GetObjectCommand,
  type PutObjectCommandInput,
  type S3,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mime from "mime";
import { customAlphabet } from "nanoid";

import { isLiveEnv } from "../../../helpers.js";
import { SCAN_EXEMPT_METADATA_KEY } from "./scanStatus.js";
import { s3Factory } from "./utils.js";
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

export const uploadPublicFile = async (
  file: Express.Multer.File,
  filename: string,
  filekey?: string,
) => {
  const s3 = s3Factory();

  const { params, key, fileType } = generateFileParams(file, filename, filekey);

  await s3.putObject(params);
  const fileUrl = await buildFileUrl(s3, key, "public");

  return {
    fileType,
    fileUrl,
  };
};

export const uploadPrivateFile = async (
  file: Express.Multer.File,
  filename: string,
  filekey?: string,
  /**
   * Mark the file as exempt from Scanii checks, so it can be served without ever having
   * been scanned. Only ever pass this for files the API generates itself from trusted
   * data - never for anything derived from user input. When in doubt, leave it off: an
   * unnecessary scan costs a short delay, a missing one costs us the guarantee entirely.
   */
  {
    dangerouslySkipMalwareScan = false,
  }: { dangerouslySkipMalwareScan?: boolean } = {},
) => {
  const s3 = s3Factory();

  const { params, key, fileType } = generateFileParams(file, filename, filekey);

  params.Metadata = {
    is_private: "true",
    ...(dangerouslySkipMalwareScan && { [SCAN_EXEMPT_METADATA_KEY]: "true" }),
  };

  await s3.putObject(params);
  const fileUrl = await buildFileUrl(s3, key, "private");

  return {
    fileType,
    fileUrl,
  };
};

// Construct an API URL for the uploaded file
const buildFileUrl = async (
  s3: S3,
  key: string,
  path: "public" | "private",
) => {
  const s3Url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Key: key, Bucket: process.env.AWS_S3_BUCKET }),
  );
  let s3Pathname = new URL(s3Url).pathname;
  // Minio returns a pathname with bucket name prepended, remove this
  if (!isLiveEnv())
    s3Pathname = s3Pathname.replace(`/${process.env.AWS_S3_BUCKET}`, "");
  return `${process.env.API_URL_EXT}/file/${path}${s3Pathname}`;
};

export function generateFileParams(
  file: Express.Multer.File,
  filename: string,
  filekey?: string,
): {
  params: PutObjectCommandInput;
  fileType: string | null;
  key: string;
} {
  const fileType = mime.getType(filename);
  const key = `${filekey || nanoid()}/${filename}`;

  const params: PutObjectCommandInput = {
    ACL: "public-read",
    Bucket: process.env.AWS_S3_BUCKET,
    Key: key,
    Body: file.buffer,
    // We practice defence in depth for any fetch that bypasses the API by storing the headers we would serve.
    // Notably we do not persist file.mimetype because we want to control how the bytes are interpreted.
    ContentDisposition: `attachment;filename="${filename}"`,
    // `filename` is %-encoded on upload, so it is guaranteed ASCII with no quotes to break out of the header,
    // so interpolating here is safe. Downloads via the API get the decoded name - see sendFile.
    ContentType: fileType ?? "application/octet-stream",
  };

  return {
    params,
    key,
    fileType,
  };
}
