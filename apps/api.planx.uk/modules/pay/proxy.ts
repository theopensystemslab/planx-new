import type { Response, Request } from "express";
import type { Options } from "http-proxy-middleware";
import { fixRequestBody } from "http-proxy-middleware";
import { useProxy } from "../../shared/middleware/proxy.js";

export const usePayProxy = (
  options: Partial<Options>,
  req: Request,
  res: Response,
) => {
  return useProxy({
    target: "https://publicapi.payments.service.gov.uk/v1/payments",
    onProxyReq: fixRequestBody,
    headers: {
      ...(req.headers as NodeJS.Dict<string | string[]>),
      "content-type": "application/json",
      Authorization: `Bearer ${res.locals.govPayToken}`,
    },
    ...options,
  });
};
