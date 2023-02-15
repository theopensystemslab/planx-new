import { addDays } from "date-fns";
import { Request, Response, NextFunction } from "express";

import { createScheduledEvent } from "../hasura/metadata";
import { DAYS_UNTIL_EXPIRY } from "../saveAndReturn/utils";

/**
 * Create a "reminder" event for a lowcal_session record
 */
const createReminderEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { createdAt, payload } = req.body;
    if (!createdAt || !payload)
      return next({
        status: 400,
        message: "Required value missing",
      });
    const response = await createScheduledEvent({
      webhook: "{{HASURA_PLANX_API_URL}}/send-email/reminder",
      schedule_at: addDays(Date.parse(createdAt), DAYS_UNTIL_EXPIRY - 7),
      payload: payload,
      comment: `reminder_${payload.sessionId}`,
    });
    res.json(response);
  } catch (error) {
    return next({
      error,
      message: `Failed to create reminder event. Error: ${error}`,
    });
  }
};

/**
 * Create an "expiry" event for a lowcal_session record
 */
const createExpiryEvent = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { createdAt, payload } = req.body;
    if (!createdAt || !payload)
      return next({
        status: 400,
        message: "Required value missing",
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
      message: `Failed to create expiry event. Error: ${
        (error as Error).message
      }`,
    });
  }
};

export { createReminderEvent, createExpiryEvent };
