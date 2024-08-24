import { queryMock } from "../graphqlQueryMock.js";

beforeEach(() => {
  queryMock.setup(process.env.HASURA_GRAPHQL_URL!);
});
