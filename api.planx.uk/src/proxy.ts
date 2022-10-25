import { createProxyMiddleware, Options } from "http-proxy-middleware";

// debug, info, warn, error, silent
const LOG_LEVEL = process.env.NODE_ENV === "test" ? "silent" : "debug";

export function useProxy(options: Partial<Options> = {}) {
  return createProxyMiddleware({
    changeOrigin: true,
    logLevel: LOG_LEVEL,
    onError: (err, req, res, target) => {
      res.json({
        status: 500,
        message: "Something went wrong",
      });
    },
    ...options,
  });
}
