import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as fsWalk from "@nodelib/fs.walk";
import * as mime from "mime";
import * as cloudflare from "@pulumi/cloudflare";

import { createCdn } from "../utils"

const config = new pulumi.Config();

const createLPSBucket = (domain: string, oai: aws.cloudfront.OriginAccessIdentity) => {
  const lpsBucket = new aws.s3.Bucket(domain, {
    bucket: domain,
  });

  new aws.s3.BucketPolicy("lpsBucketPolicy", {
    bucket: lpsBucket.id,
    policy: pulumi.all([lpsBucket.arn, oai.iamArn]).apply(([bucketArn, oaiArn]) =>
      JSON.stringify({
        Version: "2012-10-17",
        Statement: [
          {
            Effect: "Allow",
            Principal: {
              AWS: oaiArn,
            },
            Action: "s3:GetObject",
            Resource: `${bucketArn}/*`,
          },
        ],
      })
    ),
  });

  return lpsBucket;
};

const createLogsBucket = (domain: string) => {
  const logsBucket = new aws.s3.Bucket("lpsRequestLogs", {
    bucket: `${domain}-logs`,
  });

  new aws.s3.BucketOwnershipControls("lpsRequestLogsOwnershipControls", {
    bucket: logsBucket.id,
    rule: {
      objectOwnership: "ObjectWriter",
    },
  });

  new aws.s3.BucketAclV2("lpsRequestLogsAcl", {
    bucket: logsBucket.id,
    acl: "log-delivery-write",
  });

  return logsBucket;
};

const uploadBuildSiteToBucket = (bucket: aws.s3.Bucket) => {
  fsWalk
    .walkSync("../../localplanning.services/dist/", {
      basePath: "",
      entryFilter: (e) => !e.dirent.isDirectory(),
    })
    .forEach(({ path }) => {
      const relativeFilePath = `../../localplanning.services/dist/${path}`;
      const contentType = mime.getType(relativeFilePath) || "";
      const contentFile = new aws.s3.BucketObject(
        relativeFilePath,
        {
          key: path,
          bucket,
          contentType,
          source: new pulumi.asset.FileAsset(relativeFilePath),
          cacheControl: contentType.includes("html")
            ? "no-cache"
            : `max-age=${1}, stale-while-revalidate=${60 * 60 * 24}`,
        },
        {
          parent: bucket,
        }
      );
    });
};

export const createLocalPlanningServices = (sslCert: aws.acm.Certificate) => {
  const domain = config.get("lps-domain");
  if (!domain) return;

  const oai = new aws.cloudfront.OriginAccessIdentity("lpsOAI", {
    comment: `OAI for ${domain} CloudFront distribution`,
  });

  const lpsBucket = createLPSBucket(domain, oai);
  const logsBucket = createLogsBucket(domain);

  uploadBuildSiteToBucket(lpsBucket);

  const cdn = createCdn({
    bucket: lpsBucket,
    logsBucket,
    domain,
    acmCertificateArn: sslCert.arn,
    oai,
  });

  new cloudflare.Record("localplanningservices", {
    // TODO: Update for production!
    name: "localplanning.editor.planx.dev",
    type: "CNAME",
    zoneId: config.require("cloudflare-zone-id"),
    value: cdn.domainName,
    ttl: 1,
    proxied: false, // This was causing infinite HTTPS redirects, so let's just use CloudFront only
  });

  return cdn;
};
