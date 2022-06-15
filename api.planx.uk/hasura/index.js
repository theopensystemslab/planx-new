const { GraphQLClient } = require("graphql-request");

/**
 * Connect to Hasura using the "Admin" role
 */
const AdminGraphQLClient = new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
}); 

/**
 * Connect to Hasura using the "Public" role
 */
const PublicGraphQLClient = new GraphQLClient(process.env.HASURA_GRAPHQL_URL); 

module.exports = {
  AdminGraphQLClient,
  PublicGraphQLClient,
};