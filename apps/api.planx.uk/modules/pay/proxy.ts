import type { Request, Response } from "express";
import type { Options } from "http-proxy-middleware";
import { fixRequestBody } from "http-proxy-middleware";

import { useProxy } from "../../shared/middleware/proxy.js";

export const usePayProxy = (
  options: Partial<Options>,
  req: Request,
  res: Response,
) => {
  const { on: onEvents, ...restOptions } = options;

  return useProxy({
    target: "https://publicapi.payments.service.gov.uk/v1/payments",
    on: {
      proxyReq: fixRequestBody,
      ...onEvents,
    },
    headers: {
      ...(req.headers as NodeJS.Dict<string | string[]>),
      "content-type": "application/json",
      Authorization: `Bearer ${res.locals.govPayToken}`,
    },
    ...restOptions,
  });
};
