import {
  formatRawProjectTypes,
  getFeeBreakdown,
} from "@opensystemslab/planx-core";
import { ServerError } from "../../../errors/serverError.js";
import { sendEmail } from "../../../lib/notify/index.js";
import type { TemplateRegistry } from "../../../lib/notify/templates/index.js";
import { markSessionAsSubmitted } from "../../saveAndReturn/service/utils.js";
import type { SendIntegrationController } from "../types.js";
import {
  checkEmailAuditTable,
  getSubmissionEmail,
  getSessionEmailDetailsById,
  getTeamEmailSettings,
  insertAuditEntry,
  getFlowId,
} from "./service.js";
import type {
  SiteAddress,
  TeamContactSettings,
} from "@opensystemslab/planx-core/types";

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
    const { teamId, teamSettings } = await getTeamEmailSettings(localAuthority);
    const flowId = await getFlowId(sessionId);

    // Confirm this local authority (aka team) has an email configured
    const submissionEmail = await getSubmissionEmail(teamId, flowId);
    if (!submissionEmail) {
      return next({
        status: 400,
        message: `Send to email is not enabled for this local authority (${localAuthority})`,
      });
    }

    // Confirm that this session has not already been successfully submitted before proceeding
    const lastSubmittedAppStatus = await checkEmailAuditTable(sessionId);
    if (lastSubmittedAppStatus === "Success") {
      return next({
        status: 200,
        message: `Skipping send, already successfully submitted`,
      });
    }

    const config = await getSubmitEmailConfig({
      teamSettings,
      submissionEmail,
      localAuthority,
      sessionId,
    });

    // Send the email
    const response = await sendEmail("submit", submissionEmail, config);

    // Mark session as submitted so that reminder and expiry emails are not triggered
    markSessionAsSubmitted(sessionId);

    // Create audit table entry, which triggers a Slack notification on `insert` if production
    insertAuditEntry(
      sessionId,
      localAuthority,
      submissionEmail,
      config,
      response,
    );

    return res.status(200).send({
      message: `Successfully sent to email`,
      inbox: submissionEmail,
      govuk_notify_template: "Submit",
    });
  } catch (error) {
    return next(
      new ServerError({
        message: `Failed to send "Submit" email (${localAuthority}): ${
          (error as Error).message
        }`,
      }),
    );
  }
};

const getSubmitEmailConfig = async ({
  teamSettings,
  submissionEmail,
  localAuthority,
  sessionId,
}: {
  teamSettings: TeamContactSettings;
  submissionEmail: string;
  localAuthority: string;
  sessionId: string;
}): Promise<TemplateRegistry["submit"]["config"]> => {
  try {
    const { email, flow, passportData } =
      await getSessionEmailDetailsById(sessionId);

    // Type narrowing
    if (!submissionEmail) throw Error("Submission email missing!");

    const projectTypes = passportData["proposal.projectType"] as
      | string[]
      | undefined;
    const projectType =
      projectTypes?.length && formatRawProjectTypes(projectTypes);

    const address = passportData["_address"] as SiteAddress;
    const addressLine = address?.single_line_address || address?.title;

    const applicantName = [
      passportData["applicant.name.title"],
      passportData["applicant.name.first"],
      passportData["applicant.name.last"],
    ]
      .filter(Boolean)
      .join(" ");

    const fee = getFee(passportData);

    const flowName = flow.name;

    const downloadLink = `${process.env.EDITOR_URL_EXT}/${localAuthority}/${flow.slug}/${sessionId}/download-application`;

    // Prepare email template
    const config: TemplateRegistry["submit"]["config"] = {
      personalisation: {
        serviceName: flowName,
        sessionId,
        applicantEmail: email,
        downloadLink,
        address: addressLine || "Address not submitted",
        projectType: projectType || "Project type not submitted",
        applicantName,
        fee: fee || "N/A",
      },
      emailReplyToId: teamSettings.emailReplyToId,
    };

    return config;
  } catch (error) {
    throw new Error(
      `Failed to fetch details for 'submit' email template for session ${sessionId}. Error: ${error}`,
    );
  }
};

const getFee = (passportData: Record<string, unknown>): string | undefined => {
  try {
    const payable = getFeeBreakdown(passportData).amount.payable;
    const fee = payable.toLocaleString("en-GB", {
      style: "currency",
      currency: "GBP",
    });

    return fee;
  } catch (error) {
    // Ignore (valid) error - this may not be a fee-carrying service
    return undefined;
  }
};
