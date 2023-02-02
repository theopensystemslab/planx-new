import Axios, { AxiosResponse } from "axios";

export interface RunSQLArgs {
  source: "default";
  sql: string;
}

interface SchemaAPIQuery {
  type: "run_sql";
  args: RunSQLArgs;
}

/**
 * POST a request to the Hasura Schema API
 * https://hasura.io/docs/latest/api-reference/schema-api/index/
 */
const postToSchemaAPI = async (
  query: SchemaAPIQuery
): Promise<AxiosResponse<any>> => {
  try {
    return await Axios.post(
      process.env.HASURA_SCHEMA_URL!,
      JSON.stringify(query),
      {
        headers: {
          "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
      }
    );
  } catch (error) {
    throw Error(
      (error as Error).message || "Failed to POST to Hasura Schema API"
    );
  }
};

/**
 * Run custom SQL via Hasura Schema API
 * https://hasura.io/docs/latest/api-reference/schema-api/run-sql/
 */
export const runSQL = async (sql: string) => {
  try {
    const response = await postToSchemaAPI({
      type: "run_sql",
      args: {
        source: "default",
        sql,
      },
    });
    return response.data;
  } catch (error) {
    throw Error((error as Error)?.message);
  }
};
