import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";
import * as fsWalk from "@nodelib/fs.walk";
import * as mime from "mime";
import * as tldjs from "tldjs";

import { createCdn, usEast1 } from "../utils"
import { Distribution } from "@pulumi/aws/cloudfront";

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
      const relativeFilePath = `../../editor.planx.uk/build/${path}`;
      const contentType = mime.getType(relativeFilePath) || "";
      const contentFile = new aws.s3.BucketObject(
        relativeFilePath,
        {
          key: path,
          acl: "public-read",
          bucket,
          contentType,
          source: new pulumi.asset.FileAsset(relativeFilePath),
          // https://web.dev/stale-while-revalidate/
          cacheControl: contentType.includes("html")
            ? undefined
            : `max-age=${1}, stale-while-revalidate=${60 * 60 * 24}`,
        },
        {
          parent: bucket,
        }
      );
    });
};

const createSSLCert = (domain: string) => {
  const sslCert = new aws.acm.Certificate(
    `sslCert`,
    {
      // XXX: For wildcards remember that *.example.com will only cover a single level subdomain such as www.example.com not secondary levels such as beta.www.example.com.
      domainName: domain,
      validationMethod: "DNS",
      subjectAlternativeNames: [
        // Root
        domain,
        // Wildcard / subdomains
        `*.${domain}`,
      ],
    },
    {
      provider: usEast1,
      // XXX: These records are set up upstream in the `certificates` stack.
      //   dependsOn: [caaRecordRoot, caaRecordWildcard],
    }
  );
  const sslCertValidationRecord = new cloudflare.Record(
    `sslCertValidationRecord`,
    {
      name: sslCert.domainValidationOptions[0].resourceRecordName,
      ttl: 3600,
      type: sslCert.domainValidationOptions[0].resourceRecordType,
      value: sslCert.domainValidationOptions[0].resourceRecordValue,
      zoneId: config.require("cloudflare-zone-id"),
    }
  );
  const sslCertValidation = new aws.acm.CertificateValidation(
    `sslCertValidation`,
    {
      certificateArn: sslCert.arn,
      validationRecordFqdns: [sslCertValidationRecord.name],
    },
    { provider: usEast1 }
  );

  return sslCert;
};

const createCloudflareDNSRecord = (domain: string, cdn: Distribution) => {
  const dnsRecord = new cloudflare.Record("frontend", {
    name: tldjs.getSubdomain(domain) || "@",
    type: "CNAME",
    zoneId: config.require("cloudflare-zone-id"),
    value: cdn.domainName,
    ttl: 1,
    proxied: false, // This was causing infinite HTTPS redirects, so let's just use CloudFront only
  });
}

export const createLocalPlanningServices = () => {
  const domain = config.get("lps-domain");
  // localplanning.services currently only exists in production
  if (!domain) return;

  const lpsBucket = createLPSBucket(domain);
  const logsBucket = createLogsBucket(domain);
  const sslCert = createSSLCert(domain);

  uploadBuildSiteToBucket(lpsBucket);

  const cdn = createCdn({
    bucket: lpsBucket,
    logsBucket,
    domain,
    acmCertificateArn: sslCert.arn,
  });

  createCloudflareDNSRecord(domain, cdn);

  return cdn;
};
