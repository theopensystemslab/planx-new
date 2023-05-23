import AdmZip from "adm-zip";
import { stringify } from "csv-stringify";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import { gql } from "graphql-request";
import capitalize from "lodash/capitalize";
import os from "os";
import path from "path";

import {
  generateHTMLMapStream,
  generateHTMLOverviewStream,
} from "@opensystemslab/planx-document-templates";
import { adminGraphQLClient as adminClient } from "../hasura";
import { markSessionAsSubmitted } from "../saveAndReturn/utils";
import { sendEmail } from "../notify/utils";
import { EmailSubmissionNotifyConfig } from "../types";
import { addTemplateFilesToZip, deleteFile, downloadFile, resolveStream } from "./helpers";
import { Passport } from '@opensystemslab/planx-core';
import { _admin as $admin } from "../client";
import { PlanXExportData } from "@opensystemslab/planx-document-templates/types/types";

const sendToEmail = async(req: Request, res: Response, next: NextFunction) => {
  // `/email-submission/:localAuthority` is only called via Hasura's scheduled event webhook, so body is wrapped in a "payload" key
  const { payload } = req.body;
  if (!payload?.sessionId) {
    return next({
      status: 400,
      message: `Missing application payload data to send to email`,
    });
  }

  try {
    // Confirm this local authority (aka team) has an email configured in teams.submission_email
    const { sendToEmail, notifyPersonalisation } = await getTeamEmailSettings(req.params.localAuthority);
    if (!sendToEmail) {
      return next({
        status: 400,
        message: "Send to email is not enabled for this local authority."
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
        downloadLink: `${process.env.API_URL_EXT}/download-application-files/${payload.sessionId}?email=${sendToEmail}&localAuthority=${req.params.localAuthority}`,
        ...notifyPersonalisation,
      }
    };

    // Send the email
    const response = await sendEmail("submit", sendToEmail, config);
    if (response?.message !== "Success") {
      return next({
        status: 500,
        message: `Failed to send "Submit" email: ${response?.message}`,
      });
    };
    // Mark session as submitted so that reminder and expiry emails are not triggered
    markSessionAsSubmitted(payload.sessionId);

    // Create audit table entry, which triggers a Slack notification on `insert` if production
    insertAuditEntry(payload.sessionId, req.params.localAuthority, sendToEmail, config, response);

    return res.status(200).send({
      message: `Successfully sent "Submit" email`,
    });
  } catch (error) {
    return next({
      error,
      message: `Failed to send "Submit" email. ${(error as Error).message}`,
    });
  }
};

const downloadApplicationFiles = async(req: Request, res: Response, next: NextFunction) => {
  const sessionId: string = req.params?.sessionId;
  if (!sessionId || !req.query?.email || !req.query?.localAuthority) {
    return next({
      status: 400,
      message: "Missing values required to access application files"
    });
  }

  try {
    // Confirm that the provided email matches the stored team settings for the provided localAuthority
    const { sendToEmail } = await getTeamEmailSettings(req.query.localAuthority as string);
    if (sendToEmail !== req.query.email) {
      return next({
        status: 403,
        message: "Provided email address is not enabled to access application files"
      });
    }

    // Fetch this lowcal_session's data
    const sessionData = await getSessionData(sessionId);
    if (!sessionData) {
      return next({
        status: 400,
        message: "Failed to find session data for this sessionId"
      });
    }
    // Initiate an empty zip folder in memory
    const zip = new AdmZip();

    // Make a tmp directory to avoid file name collisions if simultaneous applications
    let tmpDir = "";
    fs.mkdtemp(path.join(os.tmpdir(), sessionId), (err, folder) => {
      if (err) throw err;
      tmpDir = folder;
    });

    // Build a csv file, write it locally, add it to the zip
    const csvData = await $admin.generateCSVData(sessionId);
    if (csvData) {
      const csvPath = path.join(tmpDir, "application.csv");
      const csvFile = fs.createWriteStream(csvPath);
  
      const csvStream = stringify(csvData, { columns: ["question", "responses", "metadata"], header: true }).pipe(csvFile);
      await resolveStream(csvStream);
      zip.addLocalFile(csvPath);
      deleteFile(csvPath);
    }

    // If the user drew a red line boundary, add a geojson file
    const geojson = sessionData.passport?.data?.["property.boundary.site"];
    if (geojson) {
      const geoBuff = Buffer.from(JSON.stringify(geojson, null, 2));
      zip.addFile("boundary.geojson", geoBuff);

      // generate and add an HTML boundary document
      const boundaryPath = path.join(tmpDir, "LocationPlan.html");
      const boundaryFile = fs.createWriteStream(boundaryPath);
      const boundaryStream =
        generateHTMLMapStream(geojson).pipe(boundaryFile);
      await resolveStream(boundaryStream);
      zip.addLocalFile(boundaryPath);
      deleteFile(boundaryPath);
    }

    // As long as we csv data, add a HTML overview document for human-readability
    if (csvData) {
      const htmlPath = path.join(tmpDir, "application.html");
      const htmlFile = fs.createWriteStream(htmlPath);
      const htmlStream = generateHTMLOverviewStream(csvData as PlanXExportData[]).pipe(
        htmlFile
      );
      await resolveStream(htmlStream);
      zip.addLocalFile(htmlPath);
      deleteFile(htmlPath);
    }

    if (sessionData.passport) {
      await addTemplateFilesToZip({ zip, tmpDir, passport: sessionData.passport, sessionId });

      const passport = new Passport(sessionData.passport);
      await downloadPassportFiles({ zip, tmpDir, passport });
    }

    // Generate and save the zip locally
    const zipName = `${sessionId}.zip`;
    zip.writeZip(zipName);

    // Send it to the client
    const zipData = zip.toBuffer();
    res.set('Content-Type','application/octet-stream');
    res.set('Content-Disposition',`attachment; filename=${zipName}`);
    res.set('Content-Length',zipData.length.toString());
    res.status(200).send(zipData);

    // Clean up the local zip file
    deleteFile(zipName);

    // TODO Record files_downloaded_at timestamp in lowcal_sessions ??
  } catch (error) {
    return next({
      error,
      message: `Failed to download application files. ${error}`,
    });
  }
};

async function getTeamEmailSettings(localAuthority: string) {
  const response = await adminClient.request(
    gql`
      query GetTeamEmailSettings(
        $slug: String
      ) {
        teams(where: {slug: {_eq: $slug}}) {
          sendToEmail: submission_email
          notifyPersonalisation: notify_personalisation
        }
      }
    `,
    {
      slug: localAuthority
    }
  );

  return response?.teams[0];
}

async function getSessionEmailDetailsById(sessionId: string) {
  const response = await adminClient.request(
    gql`
      query GetSessionEmailDetails(
        $id: uuid!
      ) {
        lowcal_sessions_by_pk(
          id: $id
        ) {
          email
          flow {
            slug
          }
        }
      }
    `,
    {
      id: sessionId
    }
  );

  return response?.lowcal_sessions_by_pk;
}

async function getSessionData(sessionId: string) {
  const response = await adminClient.request(
    gql`
      query GetSessionData(
        $id: uuid!
      ) {
        lowcal_sessions_by_pk(
          id: $id
        ) {
          data
        }
      }
    `,
    {
      id: sessionId
    }
  );

  return response?.lowcal_sessions_by_pk?.data;
};

async function downloadPassportFiles(
  { zip, tmpDir, passport }:
  { zip: AdmZip, tmpDir: string, passport: Passport }
) {
  const files = passport.getFiles();
  // Download files from S3 and add them to the zip folder
  if (files.length > 0) {
    for (const file of files) {
      // Ensure unique filename by combining original filename and S3 folder name, which is a nanoid
      // This ensures that all uploaded files are present in the zip, even if they are duplicates
      const uniqueFilename = file.split("/").slice(-2).join("-");
      const filePath = path.join(tmpDir, uniqueFilename);
      await downloadFile(file, filePath, zip);
    }
  }
}

async function insertAuditEntry(
  sessionId: string, 
  teamSlug: string, 
  recipient: string, 
  notifyRequest: EmailSubmissionNotifyConfig,
  sendEmailResponse: {
    message: string;
    expiryDate?: string;
  }) {
  const response = await adminClient.request(
    gql`
      mutation CreateEmailApplication(
        $session_id: uuid!,
        $team_slug: String,
        $recipient: String,
        $request: jsonb,
        $response: jsonb
      ) {
        insert_email_applications_one(object: {
          session_id: $session_id,
          team_slug: $team_slug,
          recipient: $recipient,
          request: $request,
          response: $response
        }) {
          id
        }
      }
    `,
    {
      session_id: sessionId,
      team_slug: teamSlug,
      recipient: recipient,
      request: notifyRequest,
      response: sendEmailResponse
    }
  );

  return response?.insert_email_applications_one?.id;
}

export { sendToEmail, downloadApplicationFiles };
