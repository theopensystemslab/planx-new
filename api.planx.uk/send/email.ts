import type { NextFunction, Request, Response } from "express";
import { gql } from "graphql-request";
import capitalize from "lodash/capitalize";
import { markSessionAsSubmitted } from "../saveAndReturn/utils";
import { sendEmail } from "../notify";
import { EmailSubmissionNotifyConfig } from "../types";
import { buildSubmissionExportZip } from "./exportZip";
import { $api, $public } from "../client";
import { NotifyPersonalisation } from "@opensystemslab/planx-core/dist/types/team";
import { Session } from "@opensystemslab/planx-core/types";

/**
 * @swagger
 * /email-submission/{localAuthority}:
 *  post:
 *    summary: Sends an application by email using GOV.UK Notify
 *    description: Send an application by email using GOV.UK Notify. The email body includes a link to download the application files.
 *    tags:
 *      - submissions
 *    parameters:
 *      - $ref: '#/components/parameters/localAuthority'
 *    security:
 *      - hasuraAuth: []
 *    requestBody:
 *      description: This endpoint is only called via Hasura's scheduled event webhook, so body is wrapped in a `payload` key
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            $ref: '#/components/schemas/SessionPayload'
 */
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

export async function downloadApplicationFiles(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  const sessionId: string = req.params?.sessionId;
  if (!sessionId || !req.query?.email || !req.query?.localAuthority) {
    return next({
      status: 400,
      message: "Missing values required to access application files",
    });
  }

  try {
    // Confirm that the provided email matches the stored team settings for the provided localAuthority
    const { sendToEmail } = await getTeamEmailSettings(
      req.query.localAuthority as string,
    );
    if (sendToEmail !== req.query.email) {
      return next({
        status: 403,
        message:
          "Provided email address is not enabled to access application files",
      });
    }

    // Fetch this lowcal_session's data
    const sessionData = await getSessionData(sessionId);
    if (!sessionData) {
      return next({
        status: 400,
        message: "Failed to find session data for this sessionId",
      });
    }

    // create the submission zip
    const zip = await buildSubmissionExportZip({ sessionId });

    // Send it to the client
    const zipData = zip.toBuffer();
    res.set("Content-Type", "application/octet-stream");
    res.set("Content-Disposition", `attachment; filename=${zip.filename}`);
    res.set("Content-Length", zipData.length.toString());
    res.status(200).send(zipData);

    // Clean up the local zip file
    zip.remove();

    // TODO Record files_downloaded_at timestamp in lowcal_sessions ??
  } catch (error) {
    return next({
      error,
      message: `Failed to download application files. ${error}`,
    });
  }
}

interface GetTeamEmailSettings {
  teams: {
    sendToEmail: string;
    notifyPersonalisation: NotifyPersonalisation;
  }[];
}

async function getTeamEmailSettings(localAuthority: string) {
  const response = await $api.client.request<GetTeamEmailSettings>(
    gql`
      query GetTeamEmailSettings($slug: String) {
        teams(where: { slug: { _eq: $slug } }) {
          sendToEmail: submission_email
          notifyPersonalisation: notify_personalisation
        }
      }
    `,
    {
      slug: localAuthority,
    },
  );

  return response?.teams[0];
}

interface GetSessionEmailDetailsById {
  session: {
    email: string;
    flow: {
      slug: string;
    };
  } | null;
}

async function getSessionEmailDetailsById(sessionId: string) {
  const response = await $api.client.request<GetSessionEmailDetailsById>(
    gql`
      query GetSessionEmailDetails($id: uuid!) {
        session: lowcal_sessions_by_pk(id: $id) {
          email
          flow {
            slug
          }
        }
      }
    `,
    {
      id: sessionId,
    },
  );

  if (!response.session)
    throw Error(
      `Cannot find session ${sessionId} in GetSessionEmailDetails query`,
    );

  return response.session;
}

interface GetSessionData {
  session: Partial<Pick<Session, "data">>;
}

async function getSessionData(sessionId: string) {
  const response = await $api.client.request<GetSessionData>(
    gql`
      query GetSessionData($id: uuid!) {
        session: lowcal_sessions_by_pk(id: $id) {
          data
        }
      }
    `,
    {
      id: sessionId,
    },
  );

  return response?.session?.data;
}

interface CreateEmailApplication {
  application: {
    id?: string;
  };
}

async function insertAuditEntry(
  sessionId: string,
  teamSlug: string,
  recipient: string,
  notifyRequest: EmailSubmissionNotifyConfig,
  sendEmailResponse: {
    message: string;
    expiryDate?: string;
  },
) {
  const response = await $api.client.request<CreateEmailApplication>(
    gql`
      mutation CreateEmailApplication(
        $session_id: uuid!
        $team_slug: String
        $recipient: String
        $request: jsonb
        $response: jsonb
      ) {
        application: insert_email_applications_one(
          object: {
            session_id: $session_id
            team_slug: $team_slug
            recipient: $recipient
            request: $request
            response: $response
          }
        ) {
          id
        }
      }
    `,
    {
      session_id: sessionId,
      team_slug: teamSlug,
      recipient: recipient,
      request: notifyRequest,
      response: sendEmailResponse,
    },
  );

  return response?.application?.id;
}
