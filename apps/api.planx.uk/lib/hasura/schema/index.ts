import type { AxiosError, AxiosResponse } from "axios";
import axios, { isAxiosError } from "axios";
import { z } from "zod";

export interface RunSQLArgs {
  source: "default";
  sql: string;
}

interface SchemaAPIQuery {
  type: "run_sql";
  args: RunSQLArgs;
}

/**
 * Error response from Hasura
 * Docs: https://hasura.io/docs/latest/api-reference/schema-api/run-sql/#response
 */
const hasuraErrorSchema = z.object({ error: z.string() });

const getHasuraErrorMessage = (error: AxiosError): string | undefined =>
  hasuraErrorSchema.safeParse(error.response?.data).data?.error;

const formatErrorMessage = (error: unknown): string => {
  if (!isAxiosError(error)) return (error as Error).message;

  const hasuraError = getHasuraErrorMessage(error);
  if (!hasuraError) return error.message;

  return `${error.message} - ${hasuraError}`;
};

/**
 * POST a request to the Hasura Schema API
 * https://hasura.io/docs/latest/api-reference/schema-api/index/
 */
const postToSchemaAPI = async <T>(
  query: SchemaAPIQuery,
): Promise<AxiosResponse<T>> => {
  try {
    return await axios.post(
      process.env.HASURA_SCHEMA_URL!,
      JSON.stringify(query),
      {
        headers: {
          "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
      },
    );
  } catch (error) {
    const message = formatErrorMessage(error);
    throw Error(`Failed to POST to Hasura Schema API: ${message}`);
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
