import { CoreDomainClient } from "@opensystemslab/planx-core";
/**
 * core doesn't expose a graphql interface like the graphql/hasura clients do
 * instead, it encapsulates query and business logic to only expose declarative interfaces
 */
export const _public = new CoreDomainClient({
  targetURL: process.env.REACT_APP_HASURA_URL!,
});
