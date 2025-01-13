import { sendEmail } from "../../../lib/notify/index.js";
import type { EmailSubmissionNotifyConfig } from "../../../types.js";
import { markSessionAsSubmitted } from "../../saveAndReturn/service/utils.js";
import type { SendIntegrationController } from "../types.js";
import {
  getSessionEmailDetailsById,
  getTeamEmailSettings,
  insertAuditEntry,
} from "./service.js";

export const sendToEmail: SendIntegrationController = async (
  req,
  res,
  next,
) => {
  req.setTimeout(120 * 1000); // Temporary bump to address submission timeouts

  const {
    payload: { sessionId },
  } = res.locals.parsedReq.body;
  const localAuthority = res.locals.parsedReq.params.localAuthority;

  try {
    // Confirm this local authority (aka team) has an email configured in teams.submission_email
    const { teamSettings } = await getTeamEmailSettings(localAuthority);
    if (!teamSettings.submissionEmail) {
      return next({
        status: 400,
        message: `Send to email is not enabled for this local authority (${localAuthority})`,
      });
    }

    // Get the applicant email and flow slug associated with the session
    const { email, flow } = await getSessionEmailDetailsById(sessionId);
    const flowName = flow.name;
    
    const serviceURL = `${process.env.EDITOR_URL_EXT}/${localAuthority}/${flow.slug}/${sessionId}`;

    // Prepare email template
    const config: EmailSubmissionNotifyConfig = {
      personalisation: {
        serviceName: flowName,
        sessionId,
        applicantEmail: email,
        downloadLink: `${serviceURL}/download-application`, // send to verifySubmissionEmail page
        ...teamSettings,
      },
    };

    // Send the email
    const response = await sendEmail(
      "submit",
      teamSettings.submissionEmail,
      config,
    );

    // Mark session as submitted so that reminder and expiry emails are not triggered
    markSessionAsSubmitted(sessionId);

    // Create audit table entry, which triggers a Slack notification on `insert` if production
    insertAuditEntry(
      sessionId,
      localAuthority,
      teamSettings.submissionEmail,
      config,
      response,
    );

    return res.status(200).send({
      message: `Successfully sent to email`,
      inbox: teamSettings.submissionEmail,
      govuk_notify_template: "Submit",
    });
  } catch (error) {
    return next({
      error,
      message: `Failed to send "Submit" email (${localAuthority}): ${
        (error as Error).message
      }`,
    });
  }
};
