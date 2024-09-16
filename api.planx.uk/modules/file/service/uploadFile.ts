import type S3 from "aws-sdk/clients/s3.js";
import { customAlphabet } from "nanoid";
import mime from "mime";
import { s3Factory } from "./utils.js";
import { isLiveEnv } from "../../../helpers.js";
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

export const uploadPublicFile = async (
  file: Express.Multer.File,
  filename: string,
  filekey?: string,
) => {
  const s3 = s3Factory();

  const { params, key, fileType } = generateFileParams(file, filename, filekey);

  await s3.putObject(params).promise();
  const fileUrl = buildFileUrl(key, "public");

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

  await s3.putObject(params).promise();
  const fileUrl = buildFileUrl(key, "private");

  return {
    fileType,
    fileUrl,
  };
};

// Construct an API URL for the uploaded file
const buildFileUrl = (key: string, path: "public" | "private") => {
  const s3 = s3Factory();
  const s3Url = new URL(s3.getSignedUrl("getObject", { Key: key }));
  let s3Pathname = s3Url.pathname;
  // Minio returns a pathname with bucket name prepended, remove this
  if (!isLiveEnv())
    s3Pathname = s3Pathname.replace(`/${process.env.AWS_S3_BUCKET}`, "");
  // URL.pathname has a leading "/"
  const fileUrl = `${process.env.API_URL_EXT}/file/${path}${s3Pathname}`;
  return fileUrl;
};

export function generateFileParams(
  file: Express.Multer.File,
  filename: string,
  filekey?: string,
): {
  params: S3.PutObjectRequest;
  fileType: string | null;
  key: string;
} {
  const fileType = mime.getType(filename);
  const key = `${filekey || nanoid()}/${filename}`;

  const params = {
    ACL: process.env.AWS_S3_ACL,
    Key: key,
    Body: file?.buffer || JSON.stringify(file),
    ContentDisposition: `inline;filename="${filename}"`,
    ContentType: file?.mimetype || "application/json",
  } as S3.PutObjectRequest;

  return {
    fileType,
    params,
    key,
  };
}
