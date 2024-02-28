import { ErrorRequestHandler, RequestHandler } from "express";
import { ServerError } from "./ServerError";
import { airbrake } from "./airbrake";
import airbrakeExpress from "@airbrake/node/dist/instrumentation/express";

/**
 * Sets up Airbrake metrics recording
 */
export const airbrakeMiddleware: RequestHandler = (_req, _res, next) => {
  if (!airbrake) return next();

  return airbrakeExpress.makeMiddleware(airbrake);
};

/**
 * Log errors to Airbrake
 */
export const errorLogger: ErrorRequestHandler = (
  errorObject,
  req,
  _res,
  next,
) => {
  if (!airbrake) {
    console.log(errorObject);
    return next(errorObject);
  }

  // Default Airbrake notice for all errors
  // See https://github.com/airbrake/airbrake-js/blob/master/packages/node/src/instrumentation/express.ts
  const notice = {
    error: errorObject,
    context: {
      userAddr: req.ip,
      userAgent: req.headers["user-agent"],
      url: req.protocol + "://" + req.headers.host + req.originalUrl,
      httpMethod: req.method,
      component: "express",
      route: req.route?.path?.toString(),
      action: req.route?.stack?.[0]?.name,
      referer: req.headers?.referer,
      message: "Something went wrong",
    },
  };

  // Append additional information for explicitly caught errors
  if (errorObject instanceof ServerError) {
    notice.context = {
      ...notice.context,
      // ...errorObject.context,
      message: errorObject.message,
    };

    // Log original error if provided
    if (errorObject.cause) notice.error = errorObject.cause;
  }

  // Send notice to Airbrake
  airbrake.notify(notice);

  return next({
    ...errorObject,
    message: errorObject.message.concat(", this error has been logged"),
  });
};

export const errorResponder: ErrorRequestHandler = (
  errorObject,
  _req,
  res,
  _next,
) => {
  const { status = 500, message = "Something went wrong" } = errorObject;

  res.status(status).send({
    error: message,
  });
};
