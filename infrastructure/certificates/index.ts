"use strict";

import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";
import * as cloudflare from "@pulumi/cloudflare";

const config = new pulumi.Config();

// The @pulumi/cloudflare package doesn't generate errors so this is here just to create a warning in case the CloudFlare API token is missing.
new pulumi.Config("cloudflare").requireSecret("apiToken");

// https://docs.aws.amazon.com/acm/latest/userguide/setup-caa.html
const caaRecordRoot = new cloudflare.DnsRecord("caa-record-root", {
  name: `${config.require("domain")}`,
  ttl: 600,
  type: "CAA",
  zoneId: config.require("cloudflare-zone-id"),
  data: {
    flags: "0",
    tag: "issue",
    value: "amazon.com",
  },
});

const caaRecordWildcard = new cloudflare.DnsRecord("caa-record-wildcard", {
  name: `${config.require("domain")}`,
  ttl: 600,
  type: "CAA",
  zoneId: config.require("cloudflare-zone-id"),
  data: {
    flags: "0",
    tag: "issuewild",
    value: "amazon.com",
  },
});

// note the mix of AWS and Cloudflare infra being provisioned here
const sslCert = new aws.acm.Certificate("sslCert",
  {
    // XXX: For wildcards remember that *.example.com will only cover a single level subdomain such as www.example.com not secondary levels such as beta.www.example.com.
    domainName: `${config.require("domain")}`,
    validationMethod: "DNS",
    subjectAlternativeNames: [
      // Root
      `${config.require("domain")}`,
      // Wildcard / subdomains
      `*.${config.require("domain")}`,
    ],
  },
  {
    dependsOn: [caaRecordRoot, caaRecordWildcard],
  }
);

const sslCertValidationRecord = new cloudflare.DnsRecord("sslCertValidationRecord", {
    name: sslCert.domainValidationOptions[0].resourceRecordName,
    ttl: 3600,
    type: sslCert.domainValidationOptions[0].resourceRecordType,  // "CNAME"
    content: sslCert.domainValidationOptions[0].resourceRecordValue,
    zoneId: config.require("cloudflare-zone-id"),
});

const sslCertValidation = new aws.acm.CertificateValidation("sslCertValidation", {
    certificateArn: sslCert.arn,
    validationRecordFqdns: [sslCertValidationRecord.name],
});

export const certificateArn = sslCertValidation.certificateArn;
export const domain = config.require("domain");
