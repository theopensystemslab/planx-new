import { addDays } from 'date-fns';
import { Request, Response, NextFunction } from 'express';

import { createScheduledEvent } from '../hasura/metadata';
import { DAYS_UNTIL_EXPIRY, REMINDER_DAYS_FROM_EXPIRY } from '../saveAndReturn/utils';

/**
 * Create "reminder" events for a lowcal_session record
 */
const createReminderEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { createdAt, payload } = req.body
    if (!createdAt || !payload)
      return next({
        status: 400,
        message: "Required value missing"
      });
    const response = await Promise.all(REMINDER_DAYS_FROM_EXPIRY.map((day: number) => (
      createScheduledEvent({
        webhook: "{{HASURA_PLANX_API_URL}}/send-email/reminder",
        schedule_at: addDays(Date.parse(createdAt), (DAYS_UNTIL_EXPIRY - day)),
        payload: payload,
        comment: `reminder_${payload.sessionId}_${day}day`,
      })
    )));
    res.json(response);
  } catch (error) {
    return next({
      error,
      message: `Failed to create reminder event. Error: ${error}`,
    });
  };
};

/**
 * Create an "expiry" event for a lowcal_session record
 */
const createExpiryEvent = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { createdAt, payload } = req.body
    if (!createdAt || !payload)
      return next({
        status: 400,
        message: "Required value missing"
      });
    const response = await createScheduledEvent({
      webhook: "{{HASURA_PLANX_API_URL}}/send-email/expiry",
      schedule_at: addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY),
      payload: payload,
      comment: `expiry_${payload.sessionId}`,
    });
    res.json(response);
  } catch (error) {
    return next({
      error,
      message: `Failed to create expiry event. Error: ${(error as Error).message}`,
    });
  };
};

export {
  createReminderEvent,
  createExpiryEvent,
};
