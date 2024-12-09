import {
  GetObjectCommand,
  type PutObjectCommandInput,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import mime from "mime";
import { customAlphabet } from "nanoid";
import { isLiveEnv } from "../../../helpers.js";
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
  const fileUrl = await buildFileUrl(key, "public");

  return {
    fileType,
    fileUrl,
  };
};

export const uploadPrivateFile = async (
  file: Express.Multer.File,
  filename: string,
  filekey?: string,
) => {
  const s3 = s3Factory();

  const { params, key, fileType } = generateFileParams(file, filename, filekey);

  params.Metadata = {
    is_private: "true",
  };

  await s3.putObject(params);
  const fileUrl = await buildFileUrl(key, "private");

  return {
    fileType,
    fileUrl,
  };
};

// Construct an API URL for the uploaded file
const buildFileUrl = async (key: string, path: "public" | "private") => {
  const s3 = s3Factory();
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
    ContentDisposition: `inline;filename="${filename}"`,
    ContentType: file.mimetype,
  };

  return {
    fileType,
    params,
    key,
  };
}
