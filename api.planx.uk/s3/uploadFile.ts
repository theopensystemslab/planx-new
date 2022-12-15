import S3 from "aws-sdk/clients/s3";
import { customAlphabet } from "nanoid";
import { getType } from "mime";
import { s3Factory } from "./utils";
const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

export const uploadPublicFile = async (
  file: Express.Multer.File,
  filename: string
) => {
  const s3 = s3Factory();

  const { params, key, fileType } = generateFileParams(file, filename);

  await s3.putObject(params).promise();
  const fileUrl = buildFileUrl(key, "public")

  return {
    file_type: fileType,
    fileUrl,
  };
};

export const uploadPrivateFile = async (
  file: Express.Multer.File,
  filename: string
) => {
  const s3 = s3Factory();

  const { params, key, fileType } = generateFileParams(file, filename);

  params.Metadata = {
    is_private: "true",
  };

  await s3.putObject(params).promise();
  const fileUrl = buildFileUrl(key, "private")

  return {
    file_type: fileType,
    fileUrl,
  };
};

// Construct an API URL for the uploaded file
const buildFileUrl = (key: string, path: "public" | "private") => {
  const s3 = s3Factory();
  const s3Url = new URL(s3.getSignedUrl('getObject', { Key: key }));
  // URL.pathname has a leading "/"
  const fileUrl = `${process.env.API_URL_EXT}/file/${path}${s3Url.pathname}`
  return fileUrl;
};

export function generateFileParams(
  file: Express.Multer.File,
  filename: string
): {
  params: S3.PutObjectRequest;
  fileType: string | null;
  key: string;
} {
  const fileType = getType(filename);
  const key = `${nanoid()}/${filename}`;

  const params = {
    ACL: process.env.AWS_S3_ACL,
    Key: key,
    Body: file.buffer,
    ContentDisposition: `inline;filename="${filename}"`,
    ContentType: file.mimetype,
  } as S3.PutObjectRequest;

  return {
    fileType,
    params,
    key,
  };
}
