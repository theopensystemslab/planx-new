import { addDays } from "date-fns";

import { createScheduledEvent } from "../../../../lib/hasura/metadata";
import {
  DAYS_UNTIL_EXPIRY,
  REMINDER_DAYS_FROM_EXPIRY,
} from "../../../../saveAndReturn/utils";
import { CreateSessionEvent } from "./schema";

/**
 * Create "reminder" events for a lowcal_session record
 */
export const createSessionReminderEvent = async ({
  createdAt,
  payload,
}: CreateSessionEvent) => {
  const response = await Promise.all(
    REMINDER_DAYS_FROM_EXPIRY.map((day: number) =>
      createScheduledEvent({
        webhook: "{{HASURA_PLANX_API_URL}}/send-email/reminder",
        schedule_at: addDays(createdAt, DAYS_UNTIL_EXPIRY - day),
        payload: payload,
        comment: `reminder_${payload.sessionId}_${day}day`,
      }),
    ),
  );
  return response;
};

/**
 * Create an "expiry" event for a lowcal_session record
 */
export const createSessionExpiryEvent = async ({
  createdAt,
  payload,
}: CreateSessionEvent) => {
  const response = await createScheduledEvent({
    webhook: "{{HASURA_PLANX_API_URL}}/send-email/expiry",
    schedule_at: addDays(createdAt, DAYS_UNTIL_EXPIRY),
    payload: payload,
    comment: `expiry_${payload.sessionId}`,
  });
  return [response];
};
