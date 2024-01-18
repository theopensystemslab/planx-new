import { useProxy } from "../../shared/middleware/proxy";
import { NextFunction, Request, Response } from "express";
import { IncomingMessage } from "http";
import { request } from "https";

export const OS_DOMAIN = "https://api.os.uk";

const MAP_ALLOWLIST: RegExp[] = [
  // Local development
  /^http:\/\/(127\.0\.0\.1|localhost):(3000|5173|6006|7007)\/$/i,
  // Documentation
  /^https:\/\/.*\.netlify\.app\/$/i,
  // PlanX
  /^https:\/\/.*planx\.(pizza|dev|uk)\/$/i,
  // Custom domains
  /^https:\/\/.*(\.gov\.uk\/)$/i,
];

export const useOrdnanceSurveyProxy = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (!isValid(req))
    return next({
      status: 401,
      message: "Unauthorised",
    });

  return useProxy({
    target: OS_DOMAIN,
    onProxyRes: (proxyRes) => setCORPHeaders(proxyRes, req),
    pathRewrite: (fullPath, req) => appendAPIKey(fullPath, req),
  })(req, res, next);
};

const isValid = (req: Request): boolean =>
  MAP_ALLOWLIST.some((re) => re.test(req.headers?.referer as string));

const setCORPHeaders = (proxyRes: IncomingMessage, req: Request): void => {
  proxyRes.headers["Cross-Origin-Resource-Policy"] = "cross-origin";
  proxyRes.headers["Access-Control-Allow-Origin"] = req.headers.origin;
  proxyRes.headers["Access-Control-Allow-Headers"] = "Origin, X-Requested-With, Content-Type, Accept";
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
