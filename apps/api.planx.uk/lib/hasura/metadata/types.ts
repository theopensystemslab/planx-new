import type { SendIntegration } from "@opensystemslab/planx-core/types";

import type { IsoDateString } from "../../../types.js";

export interface ScheduledEvent {
  type: string;
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

export interface GetScheduledEventsArgs {
  type: "one_off" | "cron";
  trigger_name?: string; // only when type is cron
  limit?: number;
  offset?: number;
  get_rows_count?: boolean;
  status?: ScheduledEventStatus[];
}

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
  events: {
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

export type CombinedResponse = Partial<
  Record<SendIntegration, CreateScheduledEventResponse>
>;
