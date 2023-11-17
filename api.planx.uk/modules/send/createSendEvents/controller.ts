import {
  CombinedResponse,
  createScheduledEvent,
} from "../../../lib/hasura/metadata";
import { CreateSendEventsController } from "./types";

// Create "One-off Scheduled Events" in Hasura from Send component for selected destinations
const createSendEvents: CreateSendEventsController = async (
  _req,
  res,
  next,
) => {
  const { email, uniform, bops } = res.locals.parsedReq.body;
  const { sessionId } = res.locals.parsedReq.params;

  try {
    const now = new Date();
    const combinedResponse: CombinedResponse = {};

    if (email) {
      const emailSubmissionEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/email-submission/${email.localAuthority}`,
        schedule_at: now,
        payload: email.body,
        comment: `email_submission_${sessionId}`,
      });
      combinedResponse["email"] = emailSubmissionEvent;
    }

    if (bops) {
      const bopsEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/bops/${bops.localAuthority}`,
        schedule_at: new Date(now.getTime() + 30 * 1000),
        payload: bops.body,
        comment: `bops_submission_${sessionId}`,
      });
      combinedResponse["bops"] = bopsEvent;
    }

    if (uniform) {
      const uniformEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/uniform/${uniform.localAuthority}`,
        schedule_at: new Date(now.getTime() + 60 * 1000),
        payload: uniform.body,
        comment: `uniform_submission_${sessionId}`,
      });
      combinedResponse["uniform"] = uniformEvent;
    }

    return res.json(combinedResponse);
  } catch (error) {
    return next({
      error,
      message: `Failed to create send event(s) for session ${sessionId}. Error: ${error}`,
    });
  }
};

export { createSendEvents };
