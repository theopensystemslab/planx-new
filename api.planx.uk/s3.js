const S3 = require("aws-sdk/clients/s3");
const { customAlphabet } = require("nanoid");
const { getType } = require("mime");

const nanoid = customAlphabet("1234567890abcdefghijklmnopqrstuvwxyz", 8);

const signS3Upload = (filename) =>
  new Promise((res, rej) => {
    const opts = {
      // apiVersion: "2006-03-01",
      params: { Bucket: process.env.AWS_S3_BUCKET },
      region: process.env.AWS_S3_REGION,

      accessKeyId: process.env.AWS_ACCESS_KEY,
      secretAccessKey: process.env.AWS_SECRET_KEY,
    };
    const s3 = new S3(opts);

    const fileType = getType(filename);

    const params = {
      ACL: process.env.AWS_S3_ACL,
      Key: `${process.env.NODE_ENV}/${nanoid()}/${filename}`,
      ContentType: fileType,
    };

    console.log(params);

    s3.getSignedUrl("putObject", params, (err, url) => {
      if (err) return rej(err);
      return res({
        fileType,
        acl: process.env.AWS_S3_ACL,
        url,
      });
    });
  });

module.exports = { signS3Upload };
