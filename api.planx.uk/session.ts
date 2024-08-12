import { RequestHandler } from "http-proxy-middleware";

// this middleware registers dummy methods on req.session to resolve passport/cookie-session incompatibility
export const registerSessionStubs: RequestHandler = (req, _res, next): void => {
  if (req.session && !req.session.regenerate) {
    req.session.regenerate = (cb: (err?: Error) => void) => cb();
  }
  if (req.session && !req.session.save) {
    req.session.save = (cb: (err?: Error) => void) => cb();
  }
  next();
};
