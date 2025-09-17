import * as awsx from "@pulumi/awsx";
import * as pulumi from "@pulumi/pulumi";

import { CustomDomains } from "../../common/teams";

const config = new pulumi.Config();

export const generateCORSAllowList = (customDomains: CustomDomains, domain: string): awsx.ecs.KeyValuePair => {
  const customDomainURLs = customDomains.map(team => `https://${team.domain}`);
  const editorURL = `https://${domain}`;
  const apiURL = `https://api.${domain}`; // Required for requests from API docs
  const hasuraURL = `https://hasura.${domain}`; // Required for proxied auth requests

  const lpsDomain = config.get("lps-domain")
  const lpsURL = lpsDomain && `https://${lpsDomain}`;

  const microsoftLoginURLs = ["https://login.live.com, https://login.microsoftonline.com"];
  const corsAllowList = [
    ...customDomainURLs,
    editorURL,
    apiURL,
    hasuraURL,
    lpsURL,
    ...microsoftLoginURLs,
  ].filter(Boolean);

  const secret: awsx.ecs.KeyValuePair = {
    name: "CORS_ALLOWLIST",
    value: corsAllowList.join(", "),
  };

  return secret;
};