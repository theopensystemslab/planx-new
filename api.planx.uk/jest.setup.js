import dotenv from "dotenv";
import { queryMock } from "./tests/graphqlQueryMock";

dotenv.config({ override: true, path: "./.env.test" });

beforeEach(() => {
  queryMock.setup(process.env.HASURA_GRAPHQL_URL);
});
