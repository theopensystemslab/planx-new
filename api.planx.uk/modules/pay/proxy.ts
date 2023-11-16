import { Request } from "express";
import { fixRequestBody, Options } from "http-proxy-middleware";
import { useProxy } from "../../shared/middleware/proxy";

export const usePayProxy = (options: Partial<Options>, req: Request) => {
  return useProxy({
    target: "https://publicapi.payments.service.gov.uk/v1/payments",
    onProxyReq: fixRequestBody,
    headers: {
      ...(req.headers as NodeJS.Dict<string | string[]>),
      "content-type": "application/json",
      Authorization: `Bearer ${
        process.env[
          `GOV_UK_PAY_TOKEN_${req.params.localAuthority}`.toUpperCase()
        ]
      }`,
    },
    ...options,
  });
};
