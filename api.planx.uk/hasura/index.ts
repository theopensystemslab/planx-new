import { GraphQLClient } from "graphql-request";

/**
 * Connect to Hasura using the "Admin" role
 */
const adminGraphQLClient = new GraphQLClient(process.env.HASURA_GRAPHQL_URL!, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
  },
});

/**
 * Connect to Hasura using the "Public" role
 */
const publicGraphQLClient = new GraphQLClient(process.env.HASURA_GRAPHQL_URL!);

export { adminGraphQLClient, publicGraphQLClient };
