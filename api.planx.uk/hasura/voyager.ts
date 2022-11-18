import assert from "assert";
import { express as voyagerMiddleware } from "graphql-voyager/middleware";
import { NextFunction, Response, Request } from "express";

assert(process.env.GRAPHQL_URL_EXT);
export default function graphQLVoyagerHandler(
  adminKey: string | undefined = undefined
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const graphQLURL: string = process.env.GRAPHQL_URL_EXT!;
    const graphQLHost: string = new URL(graphQLURL).host;

    if (adminKey && !req.user?.sub)
      return next({ status: 401, message: "User ID missing from JWT" });

    res.header(
      "Content-Security-Policy",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net"
    );
    res.header("Content-Security-Policy", "worker-src blob:");
    res.header("Access-Control-Allow-Origin", graphQLHost);

    const headers: any = {
      "content-type": "application/json",
    };
    if (adminKey) headers["x-hasura-admin-secret"] = adminKey;

    return voyagerMiddleware({
      endpointUrl: graphQLURL,
      headersJS: JSON.stringify(headers),
    })(req, res);
  };
}
