import { addDays } from 'date-fns';
import { Request, Response, NextFunction } from 'express';

import { createScheduledEvent } from '../hasura/metadata';
import { DAYS_UNTIL_EXPIRY } from '../saveAndReturn/utils';

/**
 * Create two "reminder" events for a payment_requests record: one for the nominee and one for the agent
 */
const createPaymentReminderEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { createdAt, payload } = req.body
    if (!createdAt || !payload)
      return next({
        status: 400,
        message: "Required value missing"
      });
    const response = await Promise.all([
        createScheduledEvent({
          webhook: "{{HASURA_PLANX_API_URL}}/send-email/reminder-to-pay",
          schedule_at: addDays(Date.parse(createdAt), (DAYS_UNTIL_EXPIRY - 7)),
          payload: payload,
          comment: `reminder_to_pay_${payload.paymentRequestId}`,
        }),
        createScheduledEvent({
          webhook: "{{HASURA_PLANX_API_URL}}/send-email/reminder-to-pay-agent",
          schedule_at: addDays(Date.parse(createdAt), (DAYS_UNTIL_EXPIRY - 7)),
          payload: payload,
          comment: `reminder_to_pay_agent_${payload.paymentRequestId}`,
        }),
      ]);
    res.json(response);
  } catch (error) {
    return next({
      error,
      message: `Failed to create reminder-to-pay events. Error: ${error}`,
    });
  };
};

/**
 * Create two "expiry" events for a payment_requests record: one for the nominee and one for the agent
 */
const createPaymentExpiryEvents = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { createdAt, payload } = req.body
    if (!createdAt || !payload)
      return next({
        status: 400,
        message: "Required value missing"
      });
    const response = await Promise.all([
      createScheduledEvent({
        webhook: "{{HASURA_PLANX_API_URL}}/send-email/expired-payment-request",
        schedule_at: addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY),
        payload: payload,
        comment: `expired_payment_request_${payload.sessionId}`,
      }),
      createScheduledEvent({
        webhook: "{{HASURA_PLANX_API_URL}}/send-email/expired-payment-request-agent",
        schedule_at: addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY),
        payload: payload,
        comment: `expired_payment_request_agent_${payload.paymentRequestId}`,
      }),
    ]);
    res.json(response);
  } catch (error) {
    return next({
      error,
      message: `Failed to create expired-payment-request events. Error: ${(error as Error).message}`,
    });
  };
};

export {
  createPaymentReminderEvents,
  createPaymentExpiryEvents,
};
