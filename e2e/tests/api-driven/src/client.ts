import assert from "node:assert";
import { CoreDomainClient } from "@opensystemslab/planx-core";
import { buildJWT } from "./jwt";

// check env variables are defined
assert(process.env.HASURA_GRAPHQL_ADMIN_SECRET);
assert(process.env.HASURA_GRAPHQL_URL);

const targetURL = process.env.HASURA_GRAPHQL_URL!.replace(
  "${HASURA_PROXY_PORT}",
  process.env.HASURA_PROXY_PORT!,
);

export const $admin = new CoreDomainClient({
  auth: { adminSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET! },
  targetURL,
});

/**
 * Get client authorised to the permissions level of the provided user
 */
export const getClient = async (email: string) => {
  const jwt = await buildJWT(email);
  if (!jwt) throw Error("Unable to generate JWT for test user");

  const client = new CoreDomainClient({
    targetURL: process.env.HASURA_GRAPHQL_URL!,
    auth: { jwt },
  });

  return client;
};
