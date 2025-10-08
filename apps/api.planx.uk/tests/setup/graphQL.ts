import { queryMock } from "../graphqlQueryMock.js";
import { type MockGraphQLConfig } from "graphql-query-test-mock";

// Ensure that all API test run on the default assumption that tokens are not revoked
// This avoid needing to manually mock this before each test
export const mockIsTokenRevokedQuery: MockGraphQLConfig = {
  name: "IsTokenRevoked",
  matchOnVariables: false,
  data: {
    revokedToken: {
      revokedAt: null,
    },
  },
};

beforeEach(() => {
  queryMock.setup(process.env.HASURA_GRAPHQL_URL!);
  queryMock.mockQuery(mockIsTokenRevokedQuery);
});
