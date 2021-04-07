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
      application: { id: 1 },
    },
    matchOnVariables: false,
    variables: {
      destination_url:
        "https://southwark.bops-staging.services/api/v1/planning_applications",
      request: {},
      req_headers: {
        "accept-encoding": "gzip, deflate",
        connection: "close",
        "content-length": "10",
        "content-type": "application/json",
        host: "127.0.0.1:52677",
      },
      response: {
        type: "success",
        value: 2222,
      },
      response_headers: {
        "content-type": "application/json",
      },
    },
  });
});
