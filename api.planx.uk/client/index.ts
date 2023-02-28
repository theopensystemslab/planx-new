import { CoreDomainClient } from "@opensystemslab/core";
/**
 * core doesn't expose a graphql interface like the graphql/hasura clients do
 * instead, they encapsulates query and business logic to only expose declarative interfaces
 */
export const _admin = new CoreDomainClient({
  hasuraSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
  targetURL: process.env.HASURA_GRAPHQL_URL!,
});

export const _public = new CoreDomainClient({
  targetURL: process.env.HASURA_GRAPHQL_URL!,
});
