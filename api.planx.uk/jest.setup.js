const { QueryMock } = require("graphql-query-test-mock");

require("dotenv").config({ path: "./.env.test" });

const queryMock = new QueryMock();

beforeEach(() => {
  queryMock.setup(process.env.HASURA_GRAPHQL_URL);

  queryMock.mockQuery({
    name: "GetTeams",
    data: {
      teams: [{ id: 1 }],
    },
  });
});
