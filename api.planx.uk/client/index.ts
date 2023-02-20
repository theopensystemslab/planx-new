import { Client } from "planx-client";
/**
 * The planx-client doesn't expose a graphql interface like the graphql/hasura clients do
 * instead, they encapsulates query and business logic to only expose declarative interfaces
 */
export const adminClient = new Client({
  hasuraSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
  targetURL: process.env.HASURA_GRAPHQL_URL!,
});

export const publicClient = new Client({
  hasuraSecret: "",
  targetURL: process.env.HASURA_GRAPHQL_URL!,
});
