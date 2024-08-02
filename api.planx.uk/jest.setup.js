import dotenv from "dotenv";
import { queryMock } from "./tests/graphqlQueryMock";

dotenv.config({
  path: "./.env.test",
  override: true,
});

beforeEach(() => {
  queryMock.setup(process.env.HASURA_GRAPHQL_URL);
});
