import type { Request } from "express";
import type { ClientRequest, IncomingMessage } from "http";

import { useProxy } from "../../shared/middleware/proxy.js";

export const OS_DOMAIN = "https://api.os.uk";

/**
 * Authenticate with a header, not a query param
 * OS echoes query params back in URLs within its responses, which would expose our key
 */
const setAPIKeyHeader = (proxyReq: ClientRequest): void => {
  proxyReq.setHeader("key", process.env.ORDNANCE_SURVEY_API_KEY!);
};

// The OS Vector Tile API responds with "Server not found" if we pass these reverse-proxy headers on
const stripForwardedHost = (proxyReq: ClientRequest): void => {
  proxyReq.removeHeader("x-forwarded-host");
};

const setCORPHeaders = (proxyRes: IncomingMessage): void => {
  proxyRes.headers["Cross-Origin-Resource-Policy"] = "cross-origin";
};

const removeProxyBaseUrl = (fullPath: string, req: Request): string =>
  fullPath.replace(req.baseUrl, "");

export const useOrdnanceSurveyProxy = useProxy({
  target: OS_DOMAIN,
  on: {
    proxyReq: (proxyReq) => {
      setAPIKeyHeader(proxyReq);
      stripForwardedHost(proxyReq);
    },
    proxyRes: setCORPHeaders,
  },
  pathRewrite: removeProxyBaseUrl,
});
