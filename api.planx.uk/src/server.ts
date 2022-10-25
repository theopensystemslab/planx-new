import "isomorphic-fetch";
import { ErrorRequestHandler } from "express";
import { Server } from "http";
import airbrake from "./airbrake";
import app from "./app";

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

// Handle any server errors that were passed with next(err)
// Order is significant, this should be the final app.use()
app.use(errorHandler);

const server = new Server(app);

server.keepAliveTimeout = 30000; // 30s
server.headersTimeout = 35000; // 35s

export default server;

// declaring User in a d.ts file is overwritten by other files
declare global {
  namespace Express {
    interface User {
      jwt: string;
      sub?: string;
    }
  }
}
