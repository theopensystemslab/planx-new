import { addDays } from "date-fns";

import { createScheduledEvent } from "../../../hasura/metadata";
import {
  DAYS_UNTIL_EXPIRY,
  REMINDER_DAYS_FROM_EXPIRY,
} from "../../../saveAndReturn/utils";
import { CreatePaymentEvent } from "./schema";

/**
 * Create two "invitation" events for a payments_request record: one for the nominee and one for the agent
 */
export const createPaymentInvitationEvents = async ({
  createdAt,
  payload,
}: CreatePaymentEvent) => {
  const response = await Promise.all([
    createScheduledEvent({
      webhook: "{{HASURA_PLANX_API_URL}}/send-email/invite-to-pay",
      schedule_at: createdAt,
      payload: payload,
      comment: `payment_invitation_${payload.paymentRequestId}`,
    }),
    createScheduledEvent({
      webhook: "{{HASURA_PLANX_API_URL}}/send-email/invite-to-pay-agent",
      schedule_at: createdAt,
      payload: payload,
      comment: `payment_invitation_agent_${payload.paymentRequestId}`,
    }),
  ]);
  return response;
};

/**
 * Create "reminder" events for a payment_requests record: one for the nominee and one for the agent
 */
export const createPaymentReminderEvents = async ({
  createdAt,
  payload,
}: CreatePaymentEvent) => {
  const applicantResponse = await Promise.all(
    REMINDER_DAYS_FROM_EXPIRY.map((day: number) =>
      createScheduledEvent({
        webhook: "{{HASURA_PLANX_API_URL}}/send-email/payment-reminder",
        schedule_at: addDays(createdAt, DAYS_UNTIL_EXPIRY - day),
        payload: payload,
        comment: `payment_reminder_${payload.paymentRequestId}_${day}day`,
      }),
    ),
  );
  const agentResponse = await Promise.all(
    REMINDER_DAYS_FROM_EXPIRY.map((day: number) =>
      createScheduledEvent({
        webhook: "{{HASURA_PLANX_API_URL}}/send-email/payment-reminder-agent",
        schedule_at: addDays(createdAt, DAYS_UNTIL_EXPIRY - day),
        payload: payload,
        comment: `payment_reminder_agent_${payload.paymentRequestId}_${day}day`,
      }),
    ),
  );
  return [...applicantResponse, ...agentResponse];
};

/**
 * Create two "expiry" events for a payment_requests record: one for the nominee and one for the agent
 */
export const createPaymentExpiryEvents = async ({
  createdAt,
  payload,
}: CreatePaymentEvent) => {
  const response = await Promise.all([
    createScheduledEvent({
      webhook: "{{HASURA_PLANX_API_URL}}/send-email/payment-expiry",
      schedule_at: addDays(createdAt, DAYS_UNTIL_EXPIRY),
      payload: payload,
      comment: `payment_expiry_${payload.paymentRequestId}`,
    }),
    createScheduledEvent({
      webhook: "{{HASURA_PLANX_API_URL}}/send-email/payment-expiry-agent",
      schedule_at: addDays(createdAt, DAYS_UNTIL_EXPIRY),
      payload: payload,
      comment: `payment_expiry_agent_${payload.paymentRequestId}`,
    }),
  ]);
  return response;
};
