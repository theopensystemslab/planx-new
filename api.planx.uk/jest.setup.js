require("dotenv").config({ path: "./.env.test" });

const { queryMock } = require("./tests/graphqlQueryMock");

beforeEach(() => {
  queryMock.setup(process.env.HASURA_GRAPHQL_URL);
});
