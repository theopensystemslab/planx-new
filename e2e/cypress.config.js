const { defineConfig } = require("cypress");

module.exports = defineConfig({
  env: {
    JWT_SECRET: process.env.JWT_SECRET,
    HASURA_PROXY_PORT: process.env.HASURA_PROXY_PORT,
    HASURA_GRAPHQL_ADMIN_SECRET: process.env.HASURA_GRAPHQL_ADMIN_SECRET,
  },
  e2e: {
    specPattern: './cypress/tests/'
  },
  video: false,
});
