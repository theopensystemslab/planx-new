import { NextFunction, Request, Response } from 'express';
import { createScheduledEvent } from "../hasura/metadata";

interface CombinedResponse {
  bops?: Record<string, string>;
  uniform?: Record<string, string>;
}

// Create "One-off Scheduled Events" in Hasura from Send component for selected destinations
const createSendEvents = async (req: Request, res: Response, next: NextFunction): 
  Promise<NextFunction | Response | void> => {
  try {
    const now = new Date();
    let combinedResponse: CombinedResponse = {};

    if ("bops" in req.body) {
      const bopsEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/bops/${req.body.bops.localAuthority}`,
        schedule_at: now,
        payload: req.body.bops.body,
        comment: `bops_submission_${req.params.sessionId}`,
      });
      combinedResponse["bops"] = bopsEvent;
    }

    if ("uniform" in req.body) {
      const uniformEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/uniform/${req.body.uniform.localAuthority}`,
        schedule_at: now,
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
