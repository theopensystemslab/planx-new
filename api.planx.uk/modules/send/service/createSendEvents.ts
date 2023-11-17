import { NextFunction, Request, Response } from "express";
import {
  ScheduledEventResponse,
  createScheduledEvent,
} from "../../../lib/hasura/metadata";

interface CombinedResponse {
  bops?: ScheduledEventResponse;
  uniform?: ScheduledEventResponse;
  email?: ScheduledEventResponse;
}

// Create "One-off Scheduled Events" in Hasura from Send component for selected destinations
const createSendEvents = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<NextFunction | Response | void> => {
  try {
    const now = new Date();
    const combinedResponse: CombinedResponse = {};

    if ("email" in req.body) {
      const emailSubmissionEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/email-submission/${req.body.email.localAuthority}`,
        schedule_at: now,
        payload: req.body.email.body,
        comment: `email_submission_${req.params.sessionId}`,
      });
      combinedResponse["email"] = emailSubmissionEvent;
    }

    if ("bops" in req.body) {
      const bopsEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/bops/${req.body.bops.localAuthority}`,
        schedule_at: new Date(now.getTime() + 30 * 1000),
        payload: req.body.bops.body,
        comment: `bops_submission_${req.params.sessionId}`,
      });
      combinedResponse["bops"] = bopsEvent;
    }

    if ("uniform" in req.body) {
      const uniformEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/uniform/${req.body.uniform.localAuthority}`,
        schedule_at: new Date(now.getTime() + 60 * 1000),
        payload: req.body.uniform.body,
        comment: `uniform_submission_${req.params.sessionId}`,
      });
      combinedResponse["uniform"] = uniformEvent;
    }

    return res.json(combinedResponse);
  } catch (error) {
    return next({
      error,
      message: `Failed to create send event(s) for session ${req.params.sessionId}. Error: ${error}`,
    });
  }
};

export { createSendEvents };
