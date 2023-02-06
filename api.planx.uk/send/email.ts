import AdmZip from "adm-zip";
import { stringify } from "csv-stringify";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import { gql } from "graphql-request";
import capitalize from "lodash/capitalize";
import os from "os";
import path from "path";

import { adminGraphQLClient as adminClient } from "../hasura";
import { markSessionAsSubmitted, sendEmail } from "../saveAndReturn/utils";
import { EmailSubmissionNotifyConfig } from "../types";
import { generateDocumentReviewStream } from "./documentReview";
import { deleteFile, downloadFile } from "./helpers";


const sendToEmail = async(req: Request, res: Response, next: NextFunction) => {
  // `/email-submission/:localAuthority` is only called via Hasura's scheduled event webhook, so body is wrapped in a "payload" key
  const { payload } = req.body;
  if (!payload?.sessionId || !payload?.csv || !payload?.email) {
    return next({
      status: 400,
      message: `Missing application payload data to send to email`,
    });
  }

  try {
    // Confirm this local authority (aka team) has an email configured in teams.submission_email
    const { submission_email: sendToEmail, notify_personalisation } = await getTeamEmailSettings(req.params.localAuthority);
    if (sendToEmail) {
      // Append formatted "csv" data to lowcal_session.data so it's available later to the download-application-files endpoint
      const updatedSessionData = await appendSessionData(payload.sessionId, payload.csv);

      // TODO Prepare/improve email template
      const config: EmailSubmissionNotifyConfig = {
        personalisation: {
          emailReplyToId: notify_personalisation.emailReplyToId,
          serviceName: capitalize(payload?.flowName) || "PlanX",
          sessionId: payload.sessionId,
          applicantEmail: payload.email,
          downloadLink: `${process.env.API_URL_EXT}/download-application-files/${payload.sessionId}?email=${sendToEmail}&localAuthority=${req.params.localAuthority}`,
        }
      };

      // Send the email
      const response = await sendEmail("submit", sendToEmail, config);
      if (response?.message === "Success") {
        // Mark session as submitted so that reminder and expiry emails are not triggered
        markSessionAsSubmitted(payload.sessionId);

        // TODO create audit table entry? setup event trigger for slack notification on new row?

        return res.status(200).send({
          message: `Successfully sent "Submit" email`,
        });
      } else {
        return next({
          status: 500,
          message: `Failed to send "Submit" email: ${response?.message}`,
        });
      }
    } else {
      return next({
        status: 400,
        message: "Send to email is not enabled for this local authority."
      });
    }
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
    const { submission_email: sendToEmail, notify_personalisation } = await getTeamEmailSettings(req.query.localAuthority as string);
    if (sendToEmail != req.query.email) {
      return next({
        status: 403,
        message: "Provided email address is not enabled to access application files"
      });
    }

    // Fetch this lowcal_session's data
    const sessionData = await getSessionData(sessionId);
    if (sessionData) {
      // Initiate an empty zip folder in memory
      const zip = new AdmZip();

      // Make a tmp directory to avoid file name collisions if simultaneous applications
      let tmpDir = "";
      fs.mkdtemp(path.join(os.tmpdir(), sessionId), (err, folder) => {
        if (err) throw err;
        tmpDir = folder;
      });

      // Build a csv file, write it locally, add it to the zip
      if (sessionData.csv) {
        const csvPath = path.join(tmpDir, "application.csv");
        const csvFile = fs.createWriteStream(csvPath);

        const csvStream = stringify(sessionData.csv, { columns: ["question", "responses", "metadata"], header: true }).pipe(csvFile);
        await new Promise((resolve, reject) => {
          csvStream.on("error", reject);
          csvStream.on("finish", resolve);
        });

        zip.addLocalFile(csvPath);
        deleteFile(csvPath);
      }

      // If the user drew a red line boundary, add a geojson file
      const geojson = sessionData.passport?.data?.["property.boundary.site"];
      if (geojson) {
        const geoBuff = Buffer.from(JSON.stringify(geojson, null, 2));
        zip.addFile("boundary.geojson", geoBuff);
      }

      // As long as we csv data or geojson, add a HTML document viewer for human-readability
      if (sessionData.csv || geojson) {
        const htmlPath = path.join(tmpDir, "application.html");
        const htmlFile = fs.createWriteStream(htmlPath);
        const htmlStream = generateDocumentReviewStream({ csv: sessionData?.csv, geojson: geojson }).pipe(htmlFile);
  
        await new Promise((resolve, reject) => {
          htmlStream.on("error", reject);
          htmlStream.on("finish", resolve);
        });
  
        zip.addLocalFile(htmlPath);
        deleteFile(htmlPath);
      }

      // Next iterate through the passport and pull out the urls of any user-uploaded files
      if (sessionData.passport) {
        const files: string[] = [];
        Object.entries(sessionData.passport?.data || {})
          .filter(([, v]: any) => v?.[0]?.url)
          .forEach(([key, arr]) => {
            (arr as any[]).forEach(({ url }) => {
              files.push(url);
            });
          });
        
        // Additionally check if they uploaded a location plan instead of drawing
        if (sessionData.passport?.data?.["proposal.drawing.locationPlan"]) {
          files.push(sessionData.passport.data["proposal.drawing.locationPlan"]);
        }
  
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
    } else {
      return next({
        status: 400,
        message: "Failed to find session data for this sessionId"
      });
    }
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
      query getTeamEmailSettings(
        $slug: String
      ) {
        teams(where: {slug: {_eq: $slug}}) {
          submission_email
          notify_personalisation
        }
      }
    `,
    {
      slug: localAuthority
    }
  );

  return response?.teams[0];
}

async function getSessionData(sessionId: string) {
  const response = await adminClient.request(
    gql`
      query getSessionData(
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

async function appendSessionData(sessionId: string, csvData: any) {
  const response = await adminClient.request(
    gql`
      mutation appendSessionData(
        $id: uuid!
        $data: jsonb
      ) {
        update_lowcal_sessions_by_pk(
          pk_columns: {id: $id},
          _append: {data: $data}
        ) {
          data
        }
      }
    `,
    {
      id: sessionId,
      data: { "csv": csvData }
    }
  );

  return response?.update_lowcal_sessions_by_pk?.data;
}

export { sendToEmail, downloadApplicationFiles };
