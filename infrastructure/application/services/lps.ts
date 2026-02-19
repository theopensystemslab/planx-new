import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as fsWalk from "@nodelib/fs.walk";
import * as mime from "mime";
import * as cloudflare from "@pulumi/cloudflare";

import { createCdn, usEast1 } from "../utils";

// The @pulumi/cloudflare package doesn't generate errors so this is here just to create a warning in case the CloudFlare API token is missing.
new pulumi.Config("cloudflare").requireSecret("apiToken");

const env = pulumi.getStack();
const config = new pulumi.Config();

const createLPSBucket = (
  domain: string,
  oai: aws.cloudfront.OriginAccessIdentity
) => {
  const lpsBucket = new aws.s3.Bucket(domain, {
    bucket: domain,
  });

  // Set bucket policy to allow the OAI to read objects.
  new aws.s3.BucketPolicy("lpsBucketPolicy", {
    bucket: lpsBucket.id,
    policy: pulumi
      .all([lpsBucket.arn, oai.iamArn])
      .apply(([bucketArn, oaiArn]) =>
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

  const ownershipControls = new aws.s3.BucketOwnershipControls(
    "lpsRequestLogsOwnershipControls",
    {
      bucket: logsBucket.id,
      rule: {
        objectOwnership: "ObjectWriter",
      },
    }
  );

  new aws.s3.BucketAcl(
    "lpsRequestLogsAcl",
    {
      bucket: logsBucket.id,
      acl: "log-delivery-write",
    },
    { dependsOn: [ownershipControls] }
  );

  return logsBucket;
};

export const createLPSCertificates = (
  domain: string,
  planXCert: aws.acm.Certificate
): aws.acm.Certificate["arn"] => {
  // On the staging environment, LPS is hosted on a subdomain of planx.dev
  // Do not proceed to create an ACM record
  if (env === "staging") return planXCert.arn;

  // https://docs.aws.amazon.com/acm/latest/userguide/setup-caa.html
  const caaRecordRoot = new cloudflare.DnsRecord(`lps-caa-record-root`, {
    name: domain,
    ttl: 600,
    type: "CAA",
    zoneId: config.require("lps-cloudflare-zone-id"),
    data: {
      flags: "0",
      tag: "issue",
      value: "amazon.com",
    },
  });

  const sslCert = new aws.acm.Certificate(
    `lps-sslCert`,
    {
      domainName: domain,
      validationMethod: "DNS",
      subjectAlternativeNames: [
        domain,
        `www.${domain}`,
      ],
    },
    {
      provider: usEast1,
      dependsOn: [caaRecordRoot],
    }
  );

  const sslCertValidationRecord = new cloudflare.DnsRecord(
    `lps-sslCertValidationRecord`,
    {
      name: sslCert.domainValidationOptions[0].resourceRecordName,
      ttl: 3600,
      type: sslCert.domainValidationOptions[0].resourceRecordType,
      content: sslCert.domainValidationOptions[0].resourceRecordValue,
      zoneId: config.require("lps-cloudflare-zone-id"),
    }
  );

  const sslCertValidationRecordWWW = new cloudflare.DnsRecord(
    `lps-sslCertValidationRecord-www`,
    {
      name: sslCert.domainValidationOptions[1].resourceRecordName,
      ttl: 3600,
      type: sslCert.domainValidationOptions[1].resourceRecordType,
      content: sslCert.domainValidationOptions[1].resourceRecordValue,
      zoneId: config.require("lps-cloudflare-zone-id"),
    }
  );

  const sslCertValidation = new aws.acm.CertificateValidation(
    `lps-sslCertValidation`,
    {
      certificateArn: sslCert.arn,
      validationRecordFqdns: [
        sslCertValidationRecord.name,
        sslCertValidationRecordWWW.name,
      ],
    },
    {
      provider: usEast1,
    }
  );

  return sslCertValidation.certificateArn;
};

const createCNAMERecords = (domain: string, cdn: aws.cloudfront.Distribution) => {
  // Create record on planx.dev
  if (env === "staging") {
    new cloudflare.DnsRecord("localplanningservices", {
      name: domain,
      type: "CNAME",
      zoneId: config.require("cloudflare-zone-id"),
      content: cdn.domainName,
      ttl: 1,
      proxied: false,
    });
  }
  
  // Create records on localplanning.services
  if (env === "production") {
    new cloudflare.DnsRecord("localplanningservices", {
      name: domain,
      type: "CNAME",
      zoneId: config.require("lps-cloudflare-zone-id"),
      content: cdn.domainName,
      ttl: 1,
      proxied: true,
    });

    new cloudflare.DnsRecord("localplanningservices-www", {
      name: `www.${domain}`,
      type: "CNAME",
      zoneId: config.require("lps-cloudflare-zone-id"),
      content: cdn.domainName,
      ttl: 1,
      proxied: true,
    });
  }
}

export const createLocalPlanningServices = (planXCert: aws.acm.Certificate) => {
  const domain = config.require("lps-domain");
  const oai = new aws.cloudfront.OriginAccessIdentity("lpsOAI", {
    comment: `OAI for LPS CloudFront distribution`,
  });

  const lpsBucket = createLPSBucket(domain, oai);
  const logsBucket = createLogsBucket(domain);

  const acmCertificateArn = createLPSCertificates(domain, planXCert);

  const cdn = createCdn({
    bucket: lpsBucket,
    logsBucket,
    domain,
    acmCertificateArn,
    oai,
    mode: "static",
    includeWWW: env === "production",
  });

  createCNAMERecords(domain, cdn);

  return cdn;
};
