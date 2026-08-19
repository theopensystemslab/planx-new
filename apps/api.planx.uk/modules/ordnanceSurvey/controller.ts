import type { Request } from "express";
import type { IncomingMessage } from "http";

import { useProxy } from "../../shared/middleware/proxy.js";

export const OS_DOMAIN = "https://api.os.uk";

export const useOrdnanceSurveyProxy = useProxy({
  target: OS_DOMAIN,
  on: {
    proxyRes: (proxyRes) => setCORPHeaders(proxyRes),
  },
  pathRewrite: (fullPath, req) => appendAPIKey(fullPath, req as Request),
});

const setCORPHeaders = (proxyRes: IncomingMessage): void => {
  proxyRes.headers["Cross-Origin-Resource-Policy"] = "cross-origin";
};

export const appendAPIKey = (fullPath: string, req: Request): string => {
  const [path, params] = fullPath.split("?");
  // Append API key
  const updatedParams = new URLSearchParams(params);
  updatedParams.set("key", process.env.ORDNANCE_SURVEY_API_KEY!);
  // Remove our API baseUrl
  const updatedPath = path.replace(req.baseUrl, "");
  // Construct and return rewritten path
  const resultPath = [updatedPath, updatedParams.toString()].join("?");
  return resultPath;
};
