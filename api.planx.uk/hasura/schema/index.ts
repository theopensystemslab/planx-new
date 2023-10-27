import Axios, { AxiosResponse, isAxiosError } from "axios";

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
const postToSchemaAPI = async <T>(
  query: SchemaAPIQuery,
): Promise<AxiosResponse<T>> => {
  try {
    return await Axios.post(
      process.env.HASURA_SCHEMA_URL!,
      JSON.stringify(query),
      {
        headers: {
          "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
      },
    );
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? JSON.stringify(error.toJSON())
      : (error as Error).message;
    throw Error(`Failed to POST to Hasura Schema API: ${errorMessage}`);
  }
};

/**
 * https://hasura.io/docs/latest/api-reference/schema-api/run-sql/#response
 */
interface RunSQLResponse {
  result?: string[][];
}

/**
 * Run custom SQL via Hasura Schema API
 * https://hasura.io/docs/latest/api-reference/schema-api/run-sql/
 */
export const runSQL = async (sql: string) => {
  try {
    const response = await postToSchemaAPI<RunSQLResponse>({
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
