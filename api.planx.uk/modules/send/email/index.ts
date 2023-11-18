import type { NextFunction, Request, Response } from "express";
import capitalize from "lodash/capitalize";
import { markSessionAsSubmitted } from "../../saveAndReturn/service/utils";
import { sendEmail } from "../../../lib/notify";
import { EmailSubmissionNotifyConfig } from "../../../types";
import {
  getSessionEmailDetailsById,
  getTeamEmailSettings,
  insertAuditEntry,
} from "./service";

export async function sendToEmail(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  req.setTimeout(120 * 1000); // Temporary bump to address submission timeouts

  // `/email-submission/:localAuthority` is only called via Hasura's scheduled event webhook, so body is wrapped in a "payload" key
  const { payload } = req.body;
  if (!payload?.sessionId) {
    return next({
      status: 400,
      message: `Missing application payload data to send to email`,
    });
  }

  try {
    const localAuthority = req.params.localAuthority;
    // Confirm this local authority (aka team) has an email configured in teams.submission_email
    const { sendToEmail, notifyPersonalisation } =
      await getTeamEmailSettings(localAuthority);
    if (!sendToEmail) {
      return next({
        status: 400,
        message: `Send to email is not enabled for this local authority (${localAuthority})`,
      });
    }

    // Get the applicant email and flow slug associated with the session
    const { email, flow } = await getSessionEmailDetailsById(payload.sessionId);
    const flowName = capitalize(flow?.slug?.replaceAll("-", " "));

    // Prepare email template
    const config: EmailSubmissionNotifyConfig = {
      personalisation: {
        serviceName: flowName || "PlanX",
        sessionId: payload.sessionId,
        applicantEmail: email,
        downloadLink: `${process.env.API_URL_EXT}/download-application-files/${payload.sessionId}?email=${sendToEmail}&localAuthority=${localAuthority}`,
        ...notifyPersonalisation,
      },
    };

    // Send the email
    const response = await sendEmail("submit", sendToEmail, config);
    if (response?.message !== "Success") {
      return next({
        status: 500,
        message: `Failed to send "Submit" email (${localAuthority}): ${response?.message}`,
      });
    }
    // Mark session as submitted so that reminder and expiry emails are not triggered
    markSessionAsSubmitted(payload.sessionId);

    // Create audit table entry, which triggers a Slack notification on `insert` if production
    insertAuditEntry(
      payload.sessionId,
      localAuthority,
      sendToEmail,
      config,
      response,
    );

    return res.status(200).send({
      message: `Successfully sent "Submit" email`,
    });
  } catch (error) {
    return next({
      error,
      message: `Failed to send "Submit" email. ${(error as Error).message}`,
    });
  }
}
