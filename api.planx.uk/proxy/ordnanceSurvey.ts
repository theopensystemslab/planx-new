import { useProxy } from './index';
import { NextFunction, Request, Response } from "express";

export const OS_DOMAIN = "https://api.os.uk";

export const useOrdnanceSurveyProxy = async (
  req: Request,
  res: Response,
  next: NextFunction
) => (
  useProxy({
    target: OS_DOMAIN,
    pathRewrite: (fullPath, req) => appendAPIKey(fullPath, req)
  })(req, res, next)
);

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
