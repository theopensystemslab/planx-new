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
