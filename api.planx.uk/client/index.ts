import { CoreDomainClient } from "@opensystemslab/planx-core";
/**
 * core doesn't expose a graphql interface like the graphql/hasura clients do
 * instead, they encapsulates query and business logic to only expose declarative interfaces
 */
export const $admin = new CoreDomainClient({
  hasuraSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
  targetURL: process.env.HASURA_GRAPHQL_URL!,
});

export const $public = new CoreDomainClient({
  targetURL: process.env.HASURA_GRAPHQL_URL!,
});
