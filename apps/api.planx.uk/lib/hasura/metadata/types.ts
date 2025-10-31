import type { SendIntegration } from "@opensystemslab/planx-core/types";

import type { IsoDateString } from "../../../types.js";

type ScheduledEventRequestType =
  | "create_scheduled_event"
  | "get_scheduled_events"
  | "delete_scheduled_event";

export interface ScheduledEventRequestBody {
  type: ScheduledEventRequestType;
  args:
    | CreateScheduledEventArgs
    | GetScheduledEventsArgs
    | DeleteScheduledEventArgs;
}

export interface CreateScheduledEventArgs {
  headers: Record<string, string>[];
  retry_conf: {
    num_retries: number;
  };
  webhook: string;
  schedule_at: Date;
  payload: Record<string, unknown>;
  comment: string;
}

export type RequiredCreateScheduledEventArgs = Pick<
  CreateScheduledEventArgs,
  "webhook" | "schedule_at" | "comment" | "payload"
>;

type ScheduledEventStatus =
  | "scheduled"
  | "locked"
  | "delivered"
  | "error"
  | "dead";

type BaseGetScheduledEventsArgs = {
  limit?: number;
  offset?: number;
  get_rows_count?: boolean;
  status?: ScheduledEventStatus[];
};

type GetOneOffScheduledEventsArgs = BaseGetScheduledEventsArgs & {
  type: "one_off";
};

// if getting cron events, we need to additionally supply name of the cron trigger
type GetCronScheduledEventsArgs = BaseGetScheduledEventsArgs & {
  type: "cron";
  trigger_name: string;
};

export type GetScheduledEventsArgs =
  | GetOneOffScheduledEventsArgs
  | GetCronScheduledEventsArgs;

export interface DeleteScheduledEventArgs {
  type: "one_off" | "cron";
  event_id: string;
}

export interface CreateScheduledEventResponse {
  message: "success";
  event_id: string;
}

export interface GetScheduledEventsResponse {
  count?: number;
  events: readonly {
    id: string;
    comment: string;
    created_at: IsoDateString;
    scheduled_time: IsoDateString;
    payload: Record<string, unknown>;
    status: ScheduledEventStatus;
  }[];
}

export interface DeleteScheduledEventResponse {
  message: "success";
}

export type ScheduledEventResponse =
  | CreateScheduledEventResponse
  | GetScheduledEventsResponse
  | DeleteScheduledEventResponse;

export type CombinedResponse = Partial<
  Record<SendIntegration, CreateScheduledEventResponse>
>;
