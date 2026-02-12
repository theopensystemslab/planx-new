import * as pulumi from "@pulumi/pulumi";

import { CustomDomain } from "../../common/teams";

import { KeyValuePair } from "../types";

const config = new pulumi.Config();

export const generateCORSAllowList = (
  customDomains: CustomDomain[],
  domain: string,
): KeyValuePair => {
  const customDomainURLs = customDomains.map(team => `https://${team.domain}`);
  const editorURL = `https://${domain}`;
  const apiURL = `https://api.${domain}`; // Required for requests from API docs
  const hasuraURL = `https://hasura.${domain}`; // Required for proxied auth requests
  const microsoftLoginURLs = [
    "https://login.live.com",
    "https://login.microsoftonline.com",
  ];

  const lpsDomain = config.require("lps-domain");
  const lpsURLs = pulumi.interpolate`https://${lpsDomain}, https://www.${lpsDomain}`;

  const staticURLs = [
    ...customDomainURLs,
    editorURL,
    apiURL,
    hasuraURL,
    ...microsoftLoginURLs,
  ].filter(Boolean);

  const staticURLsString = staticURLs.join(", ");

  const secret = {
    name: "CORS_ALLOWLIST",
    value: pulumi.interpolate`${staticURLsString}, ${lpsURLs}`,
  };

  return secret;
};
