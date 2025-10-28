import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

import { CustomDomain } from "../../common/teams";

const config = new pulumi.Config();

export const generateCORSAllowList = (customDomains: CustomDomain[], domain: string): awsx.ecs.KeyValuePair => {
  const customDomainURLs = customDomains.map(team => `https://${team.domain}`);
  const editorURL = `https://${domain}`;
  const apiURL = `https://api.${domain}`; // Required for requests from API docs
  const hasuraURL = `https://hasura.${domain}`; // Required for proxied auth requests
  const microsoftLoginURLs = [
    "https://login.live.com",
    "https://login.microsoftonline.com",
  ];
  const lpsURL = pulumi.interpolate`https://${config.require("lps-domain")}`;

  const staticURLs = [
    ...customDomainURLs,
    editorURL,
    apiURL,
    hasuraURL,
    ...microsoftLoginURLs,
  ].filter(Boolean);

  const staticURLsString = staticURLs.join(", ");

  const secret: awsx.ecs.KeyValuePair = {
    name: "CORS_ALLOWLIST",
    value: pulumi.interpolate`${staticURLsString}, ${lpsURL}`,
  };

  return secret;
};