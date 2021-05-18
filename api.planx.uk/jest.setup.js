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

  queryMock.mockQuery({
    name: "CreateApplication",
    data: {
      insert_bops_applications_one: { id: 22 },
    },
    matchOnVariables: false,
    variables: {
      destination_url:
        "https://southwark.bops.services/api/v1/planning_applications",
    },
  });
});
