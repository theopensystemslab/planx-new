require("dotenv").config({ path: "./.env.test" });

import { queryMock } from "./tests/graphqlQueryMock";

beforeEach(() => {
  queryMock.setup(process.env.HASURA_GRAPHQL_URL);
});
