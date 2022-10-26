import { ErrorRequestHandler } from "express";
import airbrake from "./airbrake";

const errorHandler: ErrorRequestHandler = (errorObject, _req, res, _next) => {
  const { status = 500, message = "Something went wrong" } = (() => {
    if (errorObject.error && airbrake) {
      airbrake.notify(errorObject.error);
      return {
        ...errorObject,
        message: errorObject.message.concat(", this error has been logged"),
      };
    } else {
      return errorObject;
    }
  })();

  res.status(status).send({
    error: message,
  });
};

export default errorHandler;
