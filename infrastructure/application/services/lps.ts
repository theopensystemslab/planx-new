import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as fsWalk from "@nodelib/fs.walk";
import * as mime from "mime";

import { createCdn } from "../utils"

const config = new pulumi.Config();

const createLPSBucket = (domain: string) => {
  const lpsBucket = new aws.s3.Bucket(domain, {
    bucket: domain,
    website: {
      indexDocument: "index.html",
      errorDocument: "404.html",
    },
  });

  return lpsBucket;
};

const createLogsBucket = (domain: string) => {
  const logsBucket = new aws.s3.Bucket("lpsRequestLogs", {
    bucket: `${domain}-logs`,
    acl: "private",
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
          acl: "public-read",
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

export const createLocalPlanningServices = () => {
  const domain = config.get("lps-domain");
  if (!domain) return;

  const lpsBucket = createLPSBucket(domain);
  const logsBucket = createLogsBucket(domain);

  uploadBuildSiteToBucket(lpsBucket);

  const cdn = createCdn({
    bucket: lpsBucket,
    logsBucket,
    domain,
  });

  return cdn;
};
