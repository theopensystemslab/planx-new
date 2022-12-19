import { useProxy } from './index';
import { NextFunction, Request, Response } from "express";
import { IncomingMessage } from 'http';

export const OS_DOMAIN = "https://api.os.uk";

const MAP_ALLOWLIST: RegExp[] = [
  /http:\/\/(127\.0\.0\.1|localhost):(5173|7007)\//i, // Local development
  /https:\/\/.*\.netlify\.app\//i, // Docs
];

export const useOrdnanceSurveyProxy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!isValid(req)) return next({
    status: 401,
    message: "Unauthorised"
  })

  return useProxy({
    target: OS_DOMAIN,
    onProxyRes: (proxyRes, req) => setCORPHeaders(proxyRes, req),
    pathRewrite: (fullPath, req) => appendAPIKey(fullPath, req)
  })(req, res, next)
};

const isValid = (req: Request): boolean => isAllowListed(req) || isPlanX(req);

const isAllowListed = (req: Request): boolean => MAP_ALLOWLIST.some(re => re.test(req.headers?.referer as string));

const isPlanX = (req: Request): boolean => Boolean(req.headers.referer?.match(/^https:\/\/.*planx\.(pizza|dev|uk)\//i)?.length);

/**
 * Allow cross-origin resources on allowed sites, fallback to same-site for PlanX
 */
const setCORPHeaders = (proxyRes: IncomingMessage, req: Request): void => {
  proxyRes.headers["Cross-Origin-Resource-Policy"] = isAllowListed(req) ? "cross-origin" : "same-site";
}

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
