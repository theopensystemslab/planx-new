import { expressjwt } from "express-jwt";

// XXX: Currently not checking for JWT and including req.user in every
//      express endpoint because authentication also uses req.user. More info:
//      https://github.com/theopensystemslab/planx-new/pull/555#issue-684435760
// TODO: requestProperty can now be set. This might resolve the above issue.
export const useJWT = expressjwt({
  secret: process.env.JWT_SECRET!,
  algorithms: ["HS256"],
  credentialsRequired: true,
  requestProperty: "user",
  getToken: (req) =>
    req.cookies?.jwt ??
    req.headers.authorization?.match(/^Bearer (\S+)$/)?.[1] ??
    req.query?.token,
});
