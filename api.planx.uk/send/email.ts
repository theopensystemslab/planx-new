import AdmZip from "adm-zip";
import { stringify } from "csv-stringify";
import { NextFunction, Request, Response } from "express";
import fs from "fs";
import os from "os";
import path from "path";

import { adminGraphQLClient } from "../hasura";
import { sendEmail } from "../saveAndReturn/utils";
import { EmailSubmissionNotifyConfig } from "../types";
import { deleteFile, downloadFile } from "./helpers";

const client = adminGraphQLClient;

const sendToEmail = async(req: Request, res: Response, next: NextFunction) => {
  // `/email-submission/:localAuthority` is only called via Hasura's scheduled event webhook, so body is wrapped in a "payload" key
  const { payload } = req.body;
  if (!payload?.sessionId || !payload?.csv) {
    return next({
      status: 400,
      message: `Missing application payload data to send to email`,
    });
  }

  try {
    // Confirm this local authority (aka team) has an email configured in teams.settings
    const settings = await getTeamSettings(req.params.localAuthority);
    if (settings?.sendToEmail) {
      // Append formatted "csv" data to lowcal_session.data so it's available later to the download-application-files endpoint
      const updatedSessionData = await appendSessionData(payload.sessionId, payload.csv);

      // TODO Prepare/improve email template
      const config: EmailSubmissionNotifyConfig = {
        personalisation: {
          emailReplyToId: "TBD",
          serviceName: "TBD",
          sessionId: payload.sessionId,
          applicantEmail: "TBD",
          downloadLink: `${process.env.API_URL_EXT}/download-application-files/${payload.sessionId}?email=${settings.sendToEmail}&localAuthority=${req.params.localAuthority}`,
        }
      };

      // Send the email
      const response = await sendEmail("submit", settings.sendToEmail, config);
      return res.json(response);

      // TODO Mark lowcal_session as submitted, create/update audit table (and setup Slack notification trigger?)
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
    const settings = await getTeamSettings(req.query.localAuthority as string);
    if (settings?.sendToEmail != req.query.email) {
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
          for (let file of files) {
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

async function getTeamSettings(localAuthority: string) {
  const response = await client.request(
    `
      query getTeamSettings(
        $slug: String
      ) {
        teams(where: {slug: {_eq: $slug}}) {
          settings
        }
      }
    `,
    {
      slug: localAuthority
    }
  );

  return response?.teams[0]?.settings;
}

async function getSessionData(sessionId: string) {
  const response = await client.request(
    `
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
  const response = await client.request(
    `
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
