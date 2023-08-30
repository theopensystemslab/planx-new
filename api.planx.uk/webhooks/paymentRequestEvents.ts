import { addDays } from "date-fns";
import { Request, Response, NextFunction } from "express";

import { createScheduledEvent } from "../hasura/metadata";
import {
  DAYS_UNTIL_EXPIRY,
  REMINDER_DAYS_FROM_EXPIRY,
} from "../saveAndReturn/utils";

/**
 * Create two "invitation" events for a payments_request record: one for the nominee and one for the agent
 */
const createPaymentInvitationEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { createdAt, payload } = req.body;
    if (!createdAt || !payload)
      return next({
        status: 400,
        message: "Required value missing",
      });
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
    res.json(response);
  } catch (error) {
    return next({
      error,
      message: `Failed to create payment invitation events. Error: ${error}`,
    });
  }
};

/**
 * Create "reminder" events for a payment_requests record: one for the nominee and one for the agent
 */
const createPaymentReminderEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { createdAt, payload } = req.body;
    if (!createdAt || !payload)
      return next({
        status: 400,
        message: "Required value missing",
      });
    const applicantResponse = await Promise.all(
      REMINDER_DAYS_FROM_EXPIRY.map((day: number) =>
        createScheduledEvent({
          webhook: "{{HASURA_PLANX_API_URL}}/send-email/payment-reminder",
          schedule_at: addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY - day),
          payload: payload,
          comment: `payment_reminder_${payload.paymentRequestId}_${day}day`,
        }),
      ),
    );
    const agentResponse = await Promise.all(
      REMINDER_DAYS_FROM_EXPIRY.map((day: number) =>
        createScheduledEvent({
          webhook: "{{HASURA_PLANX_API_URL}}/send-email/payment-reminder-agent",
          schedule_at: addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY - day),
          payload: payload,
          comment: `payment_reminder_agent_${payload.paymentRequestId}_${day}day`,
        }),
      ),
    );
    res.json([...applicantResponse, ...agentResponse]);
  } catch (error) {
    return next({
      error,
      message: `Failed to create payment reminder events. Error: ${error}`,
    });
  }
};

/**
 * Create two "expiry" events for a payment_requests record: one for the nominee and one for the agent
 */
const createPaymentExpiryEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const { createdAt, payload } = req.body;
    if (!createdAt || !payload)
      return next({
        status: 400,
        message: "Required value missing",
      });
    const response = await Promise.all([
      createScheduledEvent({
        webhook: "{{HASURA_PLANX_API_URL}}/send-email/payment-expiry",
        schedule_at: addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY),
        payload: payload,
        comment: `payment_expiry_${payload.paymentRequestId}`,
      }),
      createScheduledEvent({
        webhook: "{{HASURA_PLANX_API_URL}}/send-email/payment-expiry-agent",
        schedule_at: addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY),
        payload: payload,
        comment: `payment_expiry_agent_${payload.paymentRequestId}`,
      }),
    ]);
    res.json(response);
  } catch (error) {
    return next({
      error,
      message: `Failed to create payment expiry events. Error: ${
        (error as Error).message
      }`,
    });
  }
};

export {
  createPaymentInvitationEvents,
  createPaymentReminderEvents,
  createPaymentExpiryEvents,
};
