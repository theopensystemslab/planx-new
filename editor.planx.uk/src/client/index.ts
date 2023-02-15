import { Client } from "planx-client";
/**
 * The planx-client doesn't expose a graphql interface like the graphql/hasura clients do
 * instead, it encapsulates query and business logic to only expose declarative interfaces
 */
export const publicClient = new Client({
  targetURL: process.env.REACT_APP_HASURA_URL!,
});
