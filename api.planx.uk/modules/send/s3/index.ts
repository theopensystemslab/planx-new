import type { NextFunction, Request, Response } from "express";
import { $api } from "../../../client";
import { uploadPrivateFile } from "../../file/service/uploadFile";
import { markSessionAsSubmitted } from "../../saveAndReturn/service/utils";

export async function sendToS3(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // `/upload-submission/:localAuthority` is only called via Hasura's scheduled event webhook, so body is wrapped in a "payload" key
  const { payload } = req.body;
  const localAuthority = req.params.localAuthority;

  if (!payload?.sessionId) {
    return next({
      status: 400,
      message: `Missing application payload data to send to email`,
    });
  }

  try {
    const { sessionId } = payload;

    // Only prototyping with Barnet to begin
    //   In future, confirm this local authority has an S3 bucket/folder configured in team_integrations or similar
    if (localAuthority !== "barnet") {
      return next({
        status: 400,
        message: `Send to S3 is not enabled for this local authority (${localAuthority})`,
      });
    }

    // Generate the ODP Schema JSON
    const exportData = await $api.export.digitalPlanningDataPayload(sessionId);

    // Create and upload the data as an S3 file
    const { fileUrl } = await uploadPrivateFile(exportData, `${sessionId}.json`, "barnet-prototype");

    // Mark session as submitted so that reminder and expiry emails are not triggered
    markSessionAsSubmitted(sessionId);

    // TODO Create and update an audit table entry

    return res.status(200).send({
      message: `Successfully uploaded submission to S3: ${fileUrl}`,
    });
  } catch (error) {
    return next({
      error,
      message: `Failed to upload submission to S3 (${localAuthority}): ${
        (error as Error).message
      }`,
    });
  }
}
