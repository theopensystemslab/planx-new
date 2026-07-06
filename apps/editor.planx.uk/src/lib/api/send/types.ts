import { SendIntegration } from "@opensystemslab/planx-core/types";

export type SendResponse = Record<SendIntegration, { event_id: string }>;

export type CombinedEventsPayload = Partial<
  Record<SendIntegration, EventPayload>
>;

export interface EventPayload {
  localAuthority: string;
  body: {
    sessionId: string;
  };
}

export interface DownloadSubmissionResponse {
  error:
    | "INVALID_ACCESS_TOKEN"
    | "REVOKED_ACCESS_TOKEN"
    | "EXPIRED_ACCESS_TOKEN";
}
