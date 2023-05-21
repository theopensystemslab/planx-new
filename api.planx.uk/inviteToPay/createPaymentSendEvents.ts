import { NextFunction, Request, Response } from 'express';
import { createScheduledEvent } from "../hasura/metadata";
import { _admin as $admin } from '../client';
import { getMostRecentPublishedFlow } from '../helpers';

type Destination = "bops" | "uniform" | "email";

interface CombinedResponse {
  bops?: Record<string, string>;
  uniform?: Record<string, string>;
  email?: Record<string, string>;
}

// Create "One-off Scheduled Events" in Hasura when a payment request is paid
const createPaymentSendEvents = async (req: Request, res: Response, next: NextFunction): 
  Promise<NextFunction | Response | void> => {
  try {
    const now = new Date();
    const combinedResponse: CombinedResponse = {};

    // TODO Get this session's published flow data, find it's Send component, determine which "destinations" we need to queue up events for
    const session = await $admin.getSessionById(req.params.sessionId);
    const publishedFlowData = await getMostRecentPublishedFlow(session.flowId);
    const destinations: Destination[] = [];

    // TODO Determine which local authority it should send to based on team & destination    

    const eventPayload = { sessionId: req.params.sessionId };
    if ("bops" in destinations) {
      const bopsEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/bops/${req.body.bops.localAuthority}`,
        schedule_at: now,
        payload: eventPayload,
        comment: `bops_submission_${req.params.sessionId}`,
      });
      combinedResponse["bops"] = bopsEvent;
    }

    if ("uniform" in destinations) {
      const uniformEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/uniform/${req.body.uniform.localAuthority}`,
        schedule_at: now,
        payload: eventPayload,
        comment: `uniform_submission_${req.params.sessionId}`,
      });
      combinedResponse["uniform"] = uniformEvent;
    }

    if ("email" in destinations) {
      const emailSubmissionEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/email-submission/${req.body.email.localAuthority}`,
        schedule_at: now,
        payload: eventPayload,
        comment: `email_submission_${req.params.sessionId}`,
      });
      combinedResponse["email"] = emailSubmissionEvent;
    }

    return res.json(combinedResponse);
  } catch (error) {
    return next({
      error,
      message: `Failed to create payment send event(s) for session ${req.params.sessionId}. Error: ${error}`,
    });
  }
};

export { createPaymentSendEvents };
