const assert = require("assert");
const S3 = require("aws-sdk/clients/s3");
const { customAlphabet } = require("nanoid");
const { getType } = require("mime");

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

assert(process.env.AWS_S3_BUCKET);
assert(process.env.AWS_S3_REGION);
assert(process.env.AWS_ACCESS_KEY);
assert(process.env.AWS_SECRET_KEY);
assert(process.env.FILE_UPLOAD_HASHING_SALT);

const uploadPublicFile = async (file, filename) => {
  const s3 = s3Factory();

  const { params, key, fileType } = generateFileParams(file, filename);

  await s3.putObject(params).promise();

  return {
    file_type: fileType,
    key,
  }
}

const uploadPrivateFile = async (file, filename) => {
  const s3 = s3Factory();

  const { params, key, fileType } = generateFileParams(file, filename);
  const file_hash = generateFileHash(key);

  params.Metadata = {
    file_hash,
  }

  await s3.putObject(params).promise();

  return {
    file_type: fileType,
    key,
    file_hash,
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
    file_hash: file.Metadata?.file_hash,
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

function generateFileParams(file, filename) {
  const fileType = getType(filename);
  const key = `${nanoid()}/${filename}`;

  const params = {
    ACL: process.env.AWS_S3_ACL,
    Key: key,
    Body: file.buffer,
    ContentDisposition: `inline;filename="${filename}"`,
    ContentType: file.mimetype,
  };

  return {
    fileType,
    params,
    key,
  }
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

function generateFileHash(fileKey) {
  return require('crypto').createHash('sha256')
    .update(`${fileKey}${process.env.FILE_UPLOAD_HASHING_SALT}`)
    .digest('hex');
}

function validateFileHash(fileKey, hash) {
  return hash === generateFileHash(fileKey);
}

module.exports = {
  getFileFromS3,
  uploadPublicFile,
  generateFileHash,
  validateFileHash,
  uploadPrivateFile
};
