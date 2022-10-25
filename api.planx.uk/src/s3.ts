import assert from "assert";
import S3 from "aws-sdk/clients/s3";
import { customAlphabet } from "nanoid";
import { getType } from "mime";

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

assert(process.env.AWS_S3_BUCKET);
assert(process.env.AWS_S3_REGION);
assert(process.env.AWS_ACCESS_KEY);
assert(process.env.AWS_SECRET_KEY);

interface SignedFile {
  fileType: string | null;
  key: string;
  acl?: string;
  url: string;
}

const signS3Upload = async (filename: string): Promise<SignedFile> => {
  const s3 = new S3({
    // apiVersion: "2006-03-01",
    params: { Bucket: process.env.AWS_S3_BUCKET },
    region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    ...useMinio(),
  });

  const fileType = getType(filename);
  const key = `${nanoid()}/${filename}`;

  const params = {
    ACL: process.env.AWS_S3_ACL,
    Key: key,
    // ContentType: fileType,
  };

  const url = await s3.getSignedUrlPromise("putObject", params);
  return {
    fileType,
    key,
    acl: process.env.AWS_S3_ACL,
    url,
  };
};

function useMinio() {
  if (process.env.NODE_ENV === "production") {
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

export { signS3Upload };
