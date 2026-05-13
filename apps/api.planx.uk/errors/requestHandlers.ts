import type { ErrorRequestHandler } from "express";
import { ServerError } from "./serverError.js";
import airbrake from "../airbrake.js";

/**
 * Check for expired JWTs, redirect to /logout if found
 */
export const expiredJWTHandler: ErrorRequestHandler = (
  errorObject,
  _res,
  res,
  next,
) => {
  const isJWTExpiryError =
    errorObject?.name === "UnauthorizedError" &&
    errorObject?.message === "jwt expired";

  if (!isJWTExpiryError) return next(errorObject);

  const logoutPage = new URL("/logout", process.env.EDITOR_URL_EXT!).toString();
  return res.redirect(logoutPage);
};

/**
 * Handle missing JWTs from autheneticated routes - likely requests from bots, frontend errors, or frontend race conditions
 * Log request context for debugging but do not send to Airbrake
 */
export const noTokenHandler: ErrorRequestHandler = (
  errorObject,
  req,
  res,
  next,
) => {
  const isMissingTokenError =
    errorObject?.name === "UnauthorizedError" &&
    errorObject?.message === "No authorization token was found";

  if (!isMissingTokenError) return next(errorObject);

  console.debug({
    message: "Request missing auth token",
    method: req.method,
    path: req.path,
    userAgent: req.headers["user-agent"],
    referer: req.headers["referer"],
    ip: req.ip,
  });

  return res.status(401).send({ error: "No authorization token was found" });
};

/**
 * Fallback error handler
 * Must be final Express middleware
 */
export const errorHandler: ErrorRequestHandler = (
  errorObject,
  _req,
  res,
  _next,
) => {
  const { status = 500, message = "Something went wrong" } = (() => {
    if (
      airbrake &&
      (errorObject instanceof Error || errorObject instanceof ServerError)
    ) {
      airbrake.notify(errorObject);
      return {
        ...errorObject,
        message: errorObject.message.concat(", this error has been logged"),
      };
    } else {
      console.log(errorObject);
      return errorObject;
    }
  })();

  res.status(status).send({
    error: message,
  });
};
