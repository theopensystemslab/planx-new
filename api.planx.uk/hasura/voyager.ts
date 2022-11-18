import assert from "assert";
import url from 'node:url';
import { express as voyagerMiddleware } from "graphql-voyager/middleware";
import { NextFunction, Response, Request } from "express";

assert(process.env.HASURA_GRAPHQL_URL);
export default function graphQLVoyagerHandler(
  adminKey: string | undefined = undefined
) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (adminKey && !req.user?.sub)
      return next({ status: 401, message: "User ID missing from JWT" });

    res.header(
      "Content-Security-Policy",
      "script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net"
    );
    res.header("Content-Security-Policy", "worker-src blob:");

    const headers: any = {
      "content-type": "application/json",
      "mode": "no-cors",
    };
    if (adminKey) headers["x-hasura-admin-secret"] = adminKey;

    // this is a somewhat fragile way of constructing a URL that will work outside of docker
    let graphQLURL = process.env.HASURA_GRAPHQL_URL!;
    if (graphQLURL.includes("hasura-proxy")) {
      const host: string = req.hostname;
      const graphQLHost = host.replace(/^api/, "hasura");
      graphQLURL = `//${graphQLHost}/v1/graphql`;
    }

    return voyagerMiddleware({
      endpointUrl: graphQLURL,
      headersJS: JSON.stringify(headers),
    })(req, res);
  };
}
