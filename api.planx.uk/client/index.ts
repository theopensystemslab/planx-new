import { CoreDomainClient } from "@opensystemslab/planx-core";
import { userContext } from "../modules/auth/middleware";
import { ServerError } from "../errors";

/**
 * @deprecated This client's permissions set are higher than required.
 * Should only be used by trusted service-to-service calls (e.g Hasura -> API).
 * Calls made by users should be directed through $public or the role-scoped getClient().
 *
 * Consider removing this and replacing with an "api" role using "backend-only" operations in Hasura
 */
export const $admin = new CoreDomainClient({
  auth: { adminSecret: process.env.HASURA_GRAPHQL_ADMIN_SECRET! },
  targetURL: process.env.HASURA_GRAPHQL_URL!,
});

export const $public = new CoreDomainClient({
  targetURL: process.env.HASURA_GRAPHQL_URL!,
});

/**
 * Get a planx-core client with permissions scoped to the current user.
 * This client instance ensures that all operations are restricted
 * to the permissions of the user who initiated the request.
 */
export const getClient = () => {
  const store = userContext.getStore();
  if (!store)
    throw new ServerError({
      status: 500,
      message: "Missing user context",
    });

  const client = new CoreDomainClient({
    targetURL: process.env.HASURA_GRAPHQL_URL!,
    auth: {
      jwt: store.user.jwt,
    },
  });

  return client;
};
