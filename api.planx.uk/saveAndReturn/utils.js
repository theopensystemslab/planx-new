const { GraphQLClient } = require("graphql-request");
const { NotifyClient } = require("notifications-node-client");

// Explain test and team keys here
const getNotifyClient = () =>
  // new NotifyClient(process.env.GOVUK_NOTIFY_API_KEY_TEST);
  new NotifyClient(process.env.GOVUK_NOTIFY_API_KEY_TEAM);

const getGraphQLClient = () => new GraphQLClient(process.env.HASURA_GRAPHQL_URL, {
  headers: {
    "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
});

module.exports = { getNotifyClient, getGraphQLClient };