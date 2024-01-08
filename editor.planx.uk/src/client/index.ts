import { CoreDomainClient } from "@opensystemslab/planx-core";
import { useStore } from "pages/FlowEditor/lib/store";

/**
 * core doesn't expose a graphql interface like the graphql/hasura clients do
 * instead, it encapsulates query and business logic to only expose declarative interfaces
 */
export const _public = new CoreDomainClient({
  targetURL: process.env.REACT_APP_HASURA_URL!,
});

export const _client = new CoreDomainClient({
  targetURL: process.env.REACT_APP_HASURA_URL!,
  auth: { jwt: useStore.getState().jwt || "" },
});
