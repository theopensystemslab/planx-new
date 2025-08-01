import * as awsx from "@pulumi/awsx";

import { CustomDomains } from "../../common/teams";

export const generateCORSAllowList = (customDomains: CustomDomains, domain: string): awsx.ecs.KeyValuePair => {
  const customDomainURLs = customDomains.map(team => `https://${team.domain}`);
  const editorURL = `https://${domain}`;
  const apiURL = `https://api.${domain}`; // Required for requests from API docs
  const hasuraURL = `https://hasura.${domain}`; // Required for proxied auth requests
  // TODO: Configure when staging / production infra for LPS is put in place
  // const lpsURL = "https://localplanning.services"
  const microsoftLoginURLs = ["https://login.live.com, https://login.microsoftonline.com"];
  const corsAllowList = [
    ...customDomainURLs,
    editorURL,
    apiURL,
    hasuraURL,
    ...microsoftLoginURLs,
  ];

  const secret: awsx.ecs.KeyValuePair = {
    name: "CORS_ALLOWLIST",
    value: corsAllowList.join(", "),
  };

  return secret;
};