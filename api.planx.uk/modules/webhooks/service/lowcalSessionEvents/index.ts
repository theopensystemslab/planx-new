import { addDays, differenceInMinutes } from "date-fns";

import { isLiveEnv } from "../../../../helpers.js";
import {
  createScheduledEvent,
  deleteScheduledEvent,
  getScheduledEvents,
} from "../../../../lib/hasura/metadata/index.js";
import type { DeleteScheduledEventResponse } from "../../../../lib/hasura/metadata/types.js";
import {
  DAYS_UNTIL_EXPIRY,
  REMINDER_DAYS_FROM_EXPIRY,
} from "../../../saveAndReturn/service/utils.js";
import type {
  CreateSessionDeleteEvent,
  CreateSessionEmailEvent,
} from "./schema.js";

const DELETE_EVENT_TOLERANCE_MINUTES = 5;
const DELETE_EVENT_COMMENT_TEMPLATE = (sessionId: string) =>
  `delete_${sessionId}`;

/**
 * Create "reminder" events for a lowcal_session record
 */
export const createSessionReminderEvent = async ({
  createdAt,
  payload,
}: CreateSessionEmailEvent) => {
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
}: CreateSessionEmailEvent) => {
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
  operation,
  createdAt,
  lockedAt,
  payload,
}: CreateSessionDeleteEvent) => {
  let dt;
  if (operation == "UPDATE") {
    // in this case we expect an event already exists, and delete it before creating a new one
    dt = lockedAt as Date;
    await deleteSessionDeleteEvent(payload.sessionId);
  } else if (operation == "INSERT") {
    dt = createdAt as Date;
    // on local, we drop requests triggered by inserts of old records during db seeding
    if (
      !isLiveEnv() &&
      differenceInMinutes(Date.now(), dt) > DELETE_EVENT_TOLERANCE_MINUTES
    ) {
      return [];
    }
  } else {
    throw new Error(
      `Unsupported database operation for createSessionDeleteEvent: ${operation}`,
    );
  }
  // now that we've cleaned up if necessary, we create the new event
  const response = await createScheduledEvent({
    webhook: "{{HASURA_PLANX_API_URL}}/webhooks/hasura/delete-session",
    schedule_at: addDays(dt, DAYS_UNTIL_EXPIRY),
    payload: { sessionId: payload.sessionId },
    comment: DELETE_EVENT_COMMENT_TEMPLATE(payload.sessionId),
  });
  return [response];
};

/**
 * Find and delete previously created "delete" event by sessionId
 */
const deleteSessionDeleteEvent = async (
  sessionId: string,
): Promise<DeleteScheduledEventResponse[]> => {
  // XXX: we do not include the "limit" arg, hoping Hasura returns ALL events (docs don't specify)
  const scheduledEvents = await getScheduledEvents({
    type: "one_off",
    status: ["scheduled"],
    get_rows_count: true,
  });
  console.debug(`Retrieved ${scheduledEvents.count} total scheduled events`);
  const eventsToDelete = scheduledEvents.events.filter(
    (event) => event.comment === DELETE_EVENT_COMMENT_TEMPLATE(sessionId),
  );
  console.debug(
    `Found ${eventsToDelete.length} "delete" events for session ${sessionId}`,
  );
  if (eventsToDelete.length === 0) {
    console.warn(
      `No pre-existing delete events found for session ${sessionId}`,
    );
    return [];
  }
  if (eventsToDelete.length > 1) {
    console.warn(
      `Multiple (${eventsToDelete.length}) pre-existing delete events found for session ${sessionId}`,
    );
  }
  return await Promise.all(
    eventsToDelete.map((event) =>
      deleteScheduledEvent({
        type: "one_off",
        event_id: event.id,
      }),
    ),
  );
};
