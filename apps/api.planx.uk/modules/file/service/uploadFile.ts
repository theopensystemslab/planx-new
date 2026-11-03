import {
  GetObjectCommand,
  type PutObjectCommandInput,
  type S3,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mime from "mime";
import { customAlphabet } from "nanoid";

import { ServerError } from "../../../errors/index.js";
import { isLiveEnv } from "../../../helpers.js";
import { SCAN_EXEMPT_METADATA_KEY } from "./scanStatus.js";
import { s3Factory } from "./utils.js";

export type BucketTypes = "user-data" | "payment-data";
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

export const uploadPublicFile = async (
  file: Express.Multer.File,
  filename: string,
  filekey?: string,
) => {
  const s3 = s3Factory();

  // Public files are written to user-data bucket by default
  const { params, key, fileType } = generateFileParams(
    "user-data",
    file,
    filename,
    filekey,
  );

  // we mark all objects explicitly as 'private' or not
  // note that 'public' objects written to S3 before this change will continue to carry no marker at all
  params.Metadata = { is_private: "false" };

  await s3.putObject(params);
  const fileUrl = await buildFileUrl(s3, key, "public", "user-data");

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
  bucket?: BucketTypes,
) => {
  validateFileNameLength(filename);

  const s3 = s3Factory();

  // Private files are uploaded to user-data by default, but can be configured to any known BucketType
  const { params, key, fileType } = generateFileParams(
    bucket || "user-data",
    file,
    filename,
    filekey,
  );

  params.Metadata = {
    is_private: "true",
    ...(dangerouslySkipMalwareScan && { [SCAN_EXEMPT_METADATA_KEY]: "true" }),
  };

  await s3.putObject(params);
  const fileUrl = await buildFileUrl(s3, key, "private", bucket || "user-data");

  return {
    fileType,
    fileUrl,
  };
};

const validateFileNameLength = (filename: string) => {
  if (filename.length >= 75) {
    throw new ServerError({
      message: "File name too long",
      status: 400,
    });
  }
};

// Construct an API URL for the uploaded file
const buildFileUrl = async (
  s3: S3,
  key: string,
  path: "public" | "private",
  bucket: BucketTypes,
) => {
  const bucketEnv =
    bucket === "payment-data"
      ? process.env.AWS_S3_BUCKET_PAY
      : process.env.AWS_S3_BUCKET;

  const s3Url = await getSignedUrl(
    s3,
    new GetObjectCommand({ Key: key, Bucket: bucketEnv }),
  );
  let s3Pathname = new URL(s3Url).pathname;
  // The S3 mock service returns a pathname with bucket name prepended, remove this
  if (!isLiveEnv()) s3Pathname = s3Pathname.replace(`/${bucketEnv}`, "");
  return `${process.env.API_URL_EXT}/file/${path}${s3Pathname}`;
};

export function generateFileParams(
  bucket: BucketTypes,
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
    // We no longer assign an ACL on PUT, so S3 defaults, IAM roles, and bucket policies reign. That is:
    // - S3 denies whatever isn't explicitly allowed
    // - There is no public bucket policy, so nothing we write can be read anonymously
    // - The writer/owner (api-user as defined in infrastructure/application layer) gets full permissions
    // Note that objects written previous to this change keep their `public-read` ACL, to avoid breaking raw S3 URLS
    // See infrastructure/data/README.md.
    Bucket:
      bucket === "payment-data"
        ? process.env.AWS_S3_BUCKET_PAY
        : process.env.AWS_S3_BUCKET,
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
