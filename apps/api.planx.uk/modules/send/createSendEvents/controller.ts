import type { CombinedResponse } from "../../../lib/hasura/metadata/types.js";
import { createScheduledEvent } from "../../../lib/hasura/metadata/index.js";
import type { CreateSendEventsController } from "./types.js";

// Create "One-off Scheduled Events" in Hasura from Send component for selected destinations
//   REMINDER to keep these destinations in sync with apps/api.planx.uk/modules/pay/service/inviteToPay/createPaymentSendEvents.ts
const createSendEvents: CreateSendEventsController = async (
  _req,
  res,
  next,
) => {
  const { email, uniform, bops, s3, fme, idox } = res.locals.parsedReq.body;
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
        schedule_at: new Date(now.getTime() + 20 * 1000),
        payload: bops.body,
        comment: `bops_submission_${sessionId}`,
      });
      combinedResponse["bops"] = bopsEvent;
    }

    if (uniform) {
      const uniformEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/uniform/${uniform.localAuthority}`,
        schedule_at: new Date(now.getTime() + 40 * 1000),
        payload: uniform.body,
        comment: `uniform_submission_${sessionId}`,
      });
      combinedResponse["uniform"] = uniformEvent;
    }

    if (idox) {
      const idoxEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/idox/${idox.localAuthority}`,
        schedule_at: new Date(now.getTime()), // now() is good for testing, but should be staggered if dual processing in future
        payload: idox.body,
        comment: `idox_nexus_submission_${sessionId}`,
      });
      combinedResponse["idox"] = idoxEvent;
    }

    if (s3) {
      const s3Event = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/upload-submission/${s3.localAuthority}`,
        schedule_at: now,
        payload: s3.body,
        comment: `upload_submission_${sessionId}`,
      });
      combinedResponse["s3"] = s3Event;
    }

    if (fme) {
      const fmeEvent = await createScheduledEvent({
        webhook: `{{HASURA_PLANX_API_URL}}/upload-submission/${fme.localAuthority}?notify=false`,
        schedule_at: now,
        payload: fme.body,
        comment: `upload_submission_without_notification_${sessionId}`,
      });
      combinedResponse["fme"] = fmeEvent;
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
