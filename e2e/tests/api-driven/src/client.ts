import assert from "node:assert";
import dotenv from "dotenv";
import { CoreDomainClient } from "@opensystemslab/planx-core";

// load env
dotenv.config({ path: "../../../.env" });

// check env variables are defined
assert(process.env.HASURA_GRAPHQL_ADMIN_SECRET);
assert(process.env.HASURA_GRAPHQL_URL);

const targetURL = process.env.HASURA_GRAPHQL_URL!.replace(
  "${HASURA_PROXY_PORT}",
  process.env.HASURA_PROXY_PORT!
);

export const $admin = new CoreDomainClient({
  hasuraSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
  targetURL,
});
