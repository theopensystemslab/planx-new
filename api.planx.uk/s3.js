const assert = require("assert");
const S3 = require("aws-sdk/clients/s3");
const { customAlphabet } = require("nanoid");
const { getType } = require("mime");

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

assert(process.env.AWS_S3_BUCKET);
assert(process.env.AWS_S3_REGION);
assert(process.env.AWS_ACCESS_KEY);
assert(process.env.AWS_SECRET_KEY);

const uploadFile = async (file, filename) => {
  const s3 = s3Factory();

  const fileType = getType(filename);
  const key = `${nanoid()}/${filename}`;

  const params = {
    ACL: process.env.AWS_S3_ACL,
    Key: key,
    Body: file.buffer,
    ContentDisposition: `inline;filename="${filename}"`,
    ContentType: file.mimetype,
  };

  await s3.putObject(params).promise();

  return {
    fileType,
    key,
    acl: process.env.AWS_S3_ACL,
  }
}

const getFileFromS3 = async (fileId) => {
  const s3 = s3Factory();

  const params = {
    Key: fileId,
  };

  const file = await s3.getObject(params).promise();

  return {
    body: file.Body,
    headers: {
      "Content-Type": file.ContentType,
      "Content-Length": file.ContentLength,
      "Content-Disposition": file.ContentDisposition,
      "Content-Encoding": file.ContentEncoding,
      "Cache-Control": file.CacheControl,
      "Expires": file.Expires,
      "Last-Modified": file.LastModified,
      "ETag": file.ETag,
    }
  }
}

function s3Factory() {
  return new S3({
    params: { Bucket: process.env.AWS_S3_BUCKET },
    region: process.env.AWS_S3_REGION,
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_KEY,
    ...useMinio(),
  });
}

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

module.exports = { getFileFromS3, uploadFile };
