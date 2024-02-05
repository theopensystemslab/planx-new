import * as awsx from "@pulumi/awsx";

import { CustomDomains } from "../../common/teams";

export const generateCORSAllowList = (customDomains: CustomDomains, domain: string): awsx.ecs.KeyValuePair => {
  const customDomainURLs = customDomains.map(team => `https://${team.domain}`);
  const editorURL = `https://${domain}`;
  const apiURL = `https://api.${domain}`; // Required for requests from API docs
  const corsAllowList = [...customDomainURLs, editorURL, apiURL];

  const secret: awsx.ecs.KeyValuePair = {
    name: "CORS_ALLOWLIST",
    value: corsAllowList.join(", "),
  };

  return secret;
};