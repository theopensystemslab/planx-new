"use strict";

import * as aws from "@pulumi/aws";
import * as pulumi from "@pulumi/pulumi";
import * as cloudflare from "@pulumi/cloudflare";

import { getCustomDomains, getPendingDomains, getValidatedDomains } from "../common/customDomains";

const config = new pulumi.Config();
const env = pulumi.getStack();

// The @pulumi/cloudflare package doesn't generate errors so this is here just to create a warning in case the Cloudflare API token is missing.
new pulumi.Config("cloudflare").requireSecret("apiToken");

// ACM certificates for CloudFront must be provisioned in us-east-1
const usEast1 = new aws.Provider("us-east-1", { region: "us-east-1" });

// TODO: consider removing these records, or expand to include Cloudflare's CAs too
// (they protect against a quite exotic attack scenario, where a compromised CA specifically targets our domain)
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

// ----------------------- custom domain certs
// Manually deployed in the certificates layer because these resources change only when councils are
// on-boarded or migrated, i.e. do not need to be recreated with every deploy of application layer by CI

const customDomains = getCustomDomains(env);
const pendingCustomDomains = getPendingDomains(customDomains);
const validatedCustomDomains = getValidatedDomains(customDomains);

// 'Mining' certificate — surfaces DNS validation records for pending domains.
// NOT attached to any CloudFront distribution. Its sole purpose is to request DNS validation
// from AWS ACM so we can extract the required CNAME records and send them to council IT teams.
const miningCert = pendingCustomDomains.length > 0
  ? new aws.acm.Certificate(
      "sslCert-dns-mining",
      {
        domainName: pendingCustomDomains[0].domain,
        subjectAlternativeNames: pendingCustomDomains.slice(1).map(d => d.domain),
        validationMethod: "DNS",
      },
      { provider: usEast1 }
    )
  : undefined;

// Shared custom domain certificate — a single DNS-validated ACM cert for all non-legacy domains.
// The application layer attaches this to the shared CloudFront distribution.
let customDomainsCertArn: pulumi.Output<string> | undefined;

if (validatedCustomDomains.length > 0) {
  const customDomainsCert = new aws.acm.Certificate(
    "sslCert-custom-domains",
    {
      domainName: validatedCustomDomains[0].domain,
      subjectAlternativeNames: validatedCustomDomains.slice(1).map(d => d.domain),
      validationMethod: "DNS",
    },
    { provider: usEast1 }
  );

  const customDomainsCertValidation = new aws.acm.CertificateValidation(
    "sslCertValidation-custom-domains",
    {
      certificateArn: customDomainsCert.arn,
      validationRecordFqdns: customDomainsCert.domainValidationOptions.apply(
        options => options.map(opt => opt.resourceRecordName)
      ),
    },
    { provider: usEast1 }
  );

  customDomainsCertArn = customDomainsCertValidation.certificateArn;
}

// ----------------------- Exports

export const domain = config.require("domain");

// ARN of validated shared cert — application layer uses this for the shared CloudFront distribution
export { customDomainsCertArn };

// ARN of the mining cert — can check this in AWS console to verify DNS validation after sending records to council
export const miningCertArn = miningCert ? miningCert.arn : undefined;

// DNS validation records that councils need to add before we can move domain to shared cert/CDN
export const pendingCouncilDnsRecords = miningCert
  ? miningCert.domainValidationOptions.apply((options: aws.types.output.acm.CertificateDomainValidationOption[]) =>
      options.map((opt) => ({
        domain: opt.domainName,
        validationCname: {
          name: opt.resourceRecordName,
          target: opt.resourceRecordValue,
        },
      }))
    )
  : undefined;
