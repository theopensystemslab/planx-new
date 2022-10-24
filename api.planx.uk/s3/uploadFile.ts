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

  return {
    file_type: fileType,
    key,
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

  return {
    file_type: fileType,
    key,
  };
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
