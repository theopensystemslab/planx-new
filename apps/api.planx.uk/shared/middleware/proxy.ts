import { ServerResponse } from "http";
import type { Options } from "http-proxy-middleware";
import { createProxyMiddleware } from "http-proxy-middleware";

export const useProxy = (options: Partial<Options> = {}) => {
  const { on: onEvents, ...restOptions } = options;

  return createProxyMiddleware({
    changeOrigin: true,
    logger: process.env.NODE_ENV === "test" ? undefined : console,
    on: {
      error: (_err, _req, res) => {
        if (res instanceof ServerResponse && !res.headersSent) {
          res.writeHead(500, { "Content-Type": "application/json" });
          res.end(
            JSON.stringify({
              status: 500,
              message: "Something went wrong",
            }),
          );
        }
      },
      ...onEvents,
    },
    ...restOptions,
  });
};
