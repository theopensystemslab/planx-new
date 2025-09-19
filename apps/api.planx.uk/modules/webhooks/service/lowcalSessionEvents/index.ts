import { addDays, differenceInMinutes } from "date-fns";

import { createScheduledEvent } from "../../../../lib/hasura/metadata/index.js";
import {
  DAYS_UNTIL_EXPIRY,
  REMINDER_DAYS_FROM_EXPIRY,
} from "../../../saveAndReturn/service/utils.js";
import type { CreateSessionEvent } from "./schema.js";

const DELETE_EVENT_TOLERANCE_MINUTES = 5;

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

/**
 * Create a "delete" event for a lowcal_sessions record
 */
export const createSessionDeleteEvent = async ({
  createdAt,
  payload,
}: CreateSessionEvent) => {
  // we drop requests triggered by inserts of old records during db seeding (on local/staging)
  if (
    differenceInMinutes(Date.now(), createdAt) > DELETE_EVENT_TOLERANCE_MINUTES
  ) {
    return [];
  }
  const response = await createScheduledEvent({
    webhook: "{{HASURA_PLANX_API_URL}}/webhooks/hasura/delete-session",
    schedule_at: addDays(createdAt, DAYS_UNTIL_EXPIRY),
    // we strip email out of payload since it's not required downstream
    payload: { sessionId: payload.sessionId },
    comment: `delete_${payload.sessionId}`,
  });
  return [response];
};
