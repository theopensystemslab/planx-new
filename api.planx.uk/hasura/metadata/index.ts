import Axios, { AxiosResponse, isAxiosError } from "axios";

/**
 * Body posted to Hasura Metadata API to create a scheduled event
 * https://hasura.io/docs/latest/api-reference/schema-metadata-api/scheduled-triggers/#schema-metadata-create-scheduled-event
 */
interface ScheduledEvent {
  type: string;
  args: ScheduledEventArgs;
}

interface ScheduledEventArgs {
  headers: Record<string, string>[];
  retry_conf: {
    num_retries: number;
  };
  webhook: string;
  schedule_at: Date;
  payload: Record<string, any>;
  comment: string;
}

type RequiredScheduledEventArgs = Pick<
  ScheduledEventArgs,
  "webhook" | "schedule_at" | "comment" | "payload"
>;

/**
 * POST a request to the Hasura Metadata API
 * https://hasura.io/docs/latest/graphql/core/api-reference/metadata-api/index/
 */
const postToMetadataAPI = async (
  body: ScheduledEvent,
): Promise<AxiosResponse<any>> => {
  try {
    return await Axios.post(
      process.env.HASURA_METADATA_URL!,
      JSON.stringify(body),
      {
        headers: {
          "x-hasura-admin-secret": process.env.HASURA_GRAPHQL_ADMIN_SECRET!,
        },
      },
    );
  } catch (error) {
    const errorMessage = isAxiosError(error)
      ? error.toJSON()
      : (error as Error).message;
    throw Error(`Failed to POST to Hasura Metadata API: ${errorMessage}`);
  }
};

/**
 * Set up a new scheduled event in Hasura
 * https://hasura.io/docs/latest/graphql/core/api-reference/metadata-api/scheduled-triggers/#metadata-create-scheduled-event
 */
const createScheduledEvent = async (args: RequiredScheduledEventArgs) => {
  try {
    const response = await postToMetadataAPI({
      type: "create_scheduled_event",
      args: {
        ...args,
        headers: [
          {
            name: "authorization",
            value_from_env: "HASURA_PLANX_API_KEY",
          },
        ],
        retry_conf: {
          num_retries: 1,
        },
      },
    });
    return response.data;
  } catch (error) {
    throw Error((error as Error)?.message);
  }
};

export { createScheduledEvent, RequiredScheduledEventArgs };
