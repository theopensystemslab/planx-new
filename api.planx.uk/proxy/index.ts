import { createProxyMiddleware, Options } from "http-proxy-middleware";

// debug, info, warn, error, silent
const LOG_LEVEL = process.env.NODE_ENV === "test" ? "silent" : "debug";

export const useProxy = (options: Partial<Options> = {}) => {
  return createProxyMiddleware({
    changeOrigin: true,
    logLevel: LOG_LEVEL,
    onError: (_err, _req, res, _target) => {
      res.json({
        status: 500,
        message: "Something went wrong",
      });
    },
    ...options,
  });
}