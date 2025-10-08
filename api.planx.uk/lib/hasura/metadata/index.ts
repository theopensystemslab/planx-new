import type { AxiosResponse } from "axios";
import axios, { isAxiosError } from "axios";

import type {
  CreateScheduledEventResponse,
  DeleteScheduledEventArgs,
  DeleteScheduledEventResponse,
  GetScheduledEventsArgs,
  GetScheduledEventsResponse,
  RequiredCreateScheduledEventArgs,
  ScheduledEvent,
} from "./types.js";

/**
 * POST a request to the Hasura Metadata API
 * https://hasura.io/docs/latest/graphql/core/api-reference/metadata-api/index/
 */
const postToMetadataAPI = async (
  body: ScheduledEvent,
): Promise<
  AxiosResponse<
    | CreateScheduledEventResponse
    | GetScheduledEventsResponse
    | DeleteScheduledEventResponse
  >
> => {
  try {
    return await axios.post(
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
      ? JSON.stringify(error.toJSON())
      : (error as Error).message;
    throw Error(`Failed to POST to Hasura Metadata API: ${errorMessage}`);
  }
};

/**
 * Set up a new scheduled event in Hasura
 * https://hasura.io/docs/2.0/api-reference/metadata-api/scheduled-triggers/#metadata-create-scheduled-event
 */
export const createScheduledEvent = async (
  args: RequiredCreateScheduledEventArgs,
): Promise<CreateScheduledEventResponse> => {
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
    return response.data as CreateScheduledEventResponse;
  } catch (error) {
    throw Error((error as Error)?.message);
  }
};

/**
 * Get scheduled events in Hasura
 * https://hasura.io/docs/2.0/api-reference/metadata-api/scheduled-triggers/#metadata-get-scheduled-events
 */
export const getScheduledEvents = async (
  args: GetScheduledEventsArgs,
): Promise<GetScheduledEventsResponse> => {
  try {
    const response = await postToMetadataAPI({
      type: "get_scheduled_events",
      args,
    });
    return response.data as GetScheduledEventsResponse;
  } catch (error) {
    throw Error((error as Error)?.message);
  }
};

/**
 * Delete an existing scheduled event in Hasura
 * https://hasura.io/docs/2.0/api-reference/metadata-api/scheduled-triggers/#metadata-delete-scheduled-event
 */
export const deleteScheduledEvent = async (
  args: DeleteScheduledEventArgs,
): Promise<DeleteScheduledEventResponse> => {
  try {
    const response = await postToMetadataAPI({
      type: "delete_scheduled_event",
      args,
    });
    return response.data as DeleteScheduledEventResponse;
  } catch (error) {
    throw Error((error as Error)?.message);
  }
};
