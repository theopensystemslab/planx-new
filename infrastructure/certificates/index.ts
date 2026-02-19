"use strict";

import * as pulumi from "@pulumi/pulumi";
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

export const domain = config.require("domain");
