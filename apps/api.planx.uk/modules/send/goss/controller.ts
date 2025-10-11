import { ServerError } from "../../../errors/serverError.js";
import type { SendIntegrationController } from "../types.js";
import { checkGOSSAuditTable, isTeamUsingGOSS, sendToGOSS } from "./service.js";

export const sendToGOSSController: SendIntegrationController = async (
  _req,
  res,
  next,
) => {
  const {
    payload: { sessionId },
  } = res.locals.parsedReq.body;
  const localAuthority = res.locals.parsedReq.params.localAuthority;

  if (!isTeamUsingGOSS(localAuthority)) {
    return next(
      new ServerError({
        message: `Cannot submit to GOSS. Team "${localAuthority}" does not support this integration.`,
        status: 400,
      }),
    );
  }

  const previouslySubmittedApplication = await checkGOSSAuditTable(sessionId);
  if (previouslySubmittedApplication) {
    return res.status(200).send({
      sessionId,
      gossId: previouslySubmittedApplication.id,
      message: "Skipping send, already successfully submitted",
    });
  }

  const application = await sendToGOSS(sessionId);

  return res.status(200).send({
    message: "Successfully submitted GOSS application",
    application,
  });
};
