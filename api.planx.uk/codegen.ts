import { CodegenConfig } from "@graphql-codegen/cli";
import dotenv from "dotenv";
dotenv.config();

const config: CodegenConfig = {
  schema: {
    [process.env.HASURA_GRAPHQL_URL!]: {
      headers: {
        "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
      },
    },
  },
  generates: {
    "./generated/graphqlTypes.ts": {
      plugins: ["typescript"],
    },
  },
};

export default config;
