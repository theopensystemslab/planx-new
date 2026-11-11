import type { Request, Response } from "express";
import type { ClientRequest } from "http";
import type { Options } from "http-proxy-middleware";

import { useProxy } from "../../shared/middleware/proxy.js";

/**
 * Write req.body to the proxied request as JSON
 *
 * We don't use http-proxy-middleware's fixRequestBody() here, as (since v4.2.1) it only writes a body once the
 * incoming request stream has been read. For invite-to-pay, the client POSTs an empty body which body-parser never
 * reads, and buildPaymentPayload() constructs the GovPay payload server-side - fixRequestBody() would silently drop it.
 */
const writeJsonBody = (proxyReq: ClientRequest, req: Request) => {
  if (req.body === undefined) return;

  const body = JSON.stringify(req.body);
  proxyReq.setHeader("Content-Length", Buffer.byteLength(body));
  proxyReq.write(body);
};

export const usePayProxy = (
  options: Partial<Options<Request, Response>>,
  req: Request,
  res: Response,
) => {
  const { on: onEvents, ...restOptions } = options;

  return useProxy({
    target: "https://publicapi.payments.service.gov.uk/v1/payments",
    on: {
      proxyReq: writeJsonBody,
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
