import type { NextFunction, Request, Response } from "express";
import { $api } from "../../../client";
import { uploadPrivateFile } from "../../file/service/uploadFile";
import { markSessionAsSubmitted } from "../../saveAndReturn/service/utils";
import axios from "axios";
import { isApplicationTypeSupported } from "../utils/helpers";
import { Passport } from "../../../types";

export async function sendToS3(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  // `/upload-submission/:localAuthority` is only called via Hasura's scheduled event webhook, so body is wrapped in a "payload" key
  const { payload } = req.body;
  const localAuthority = req.params.localAuthority;
  const env =
    process.env.APP_ENVIRONMENT === "production" ? "production" : "staging";

  if (!payload?.sessionId) {
    return next({
      status: 400,
      message: `Missing application payload data to send to email`,
    });
  }

  try {
    const { sessionId } = payload;

    // Fetch integration credentials for this team
    const { powerAutomateWebhookURL, powerAutomateAPIKey } =
      await $api.team.getIntegrations({
        slug: localAuthority,
        encryptionKey: process.env.ENCRYPTION_KEY!,
        env,
      });

    if (!powerAutomateWebhookURL || !powerAutomateAPIKey) {
      return next({
        status: 400,
        message: `Upload to S3 is not enabled for this local authority (${localAuthority})`,
      });
    }

    const session = await $api.session.find(sessionId);
    const passport = session?.data?.passport as Passport;

    // Generate the ODP Schema JSON, skipping validation if not a supported application type
    const doValidation = isApplicationTypeSupported(passport);
    const exportData = doValidation
      ? await $api.export.digitalPlanningDataPayload(sessionId)
      : await $api.export.digitalPlanningDataPayload(sessionId, true);

    // Create and upload the data as an S3 file
    const { fileUrl } = await uploadPrivateFile(
      exportData,
      `${sessionId}.json`,
    );

    // Send a notification with the file URL to the Power Automate webook
    let webhookResponseStatus: number | undefined;
    await axios({
      method: "POST",
      url: powerAutomateWebhookURL,
      adapter: "http",
      headers: {
        "Content-Type": "application/json",
        apiKey: powerAutomateAPIKey,
      },
      data: {
        message: "New submission from PlanX",
        environment: env,
        file: fileUrl,
        payload: doValidation ? "Validated ODP Schema" : "Discretionary",
      },
    })
      .then((res) => {
        // TODO Create & update audit table entry here
        webhookResponseStatus = res.status;
      })
      .catch((error) => {
        throw new Error(
          `Failed to send submission notification to ${localAuthority}'s Power Automate Webhook (${sessionId}): ${error}`,
        );
      });

    // Mark session as submitted so that reminder and expiry emails are not triggered
    markSessionAsSubmitted(sessionId);

    return res.status(200).send({
      message: `Successfully uploaded submission to S3: ${fileUrl}`,
      payload: doValidation ? "Validated ODP Schema" : "Discretionary",
      webhookResponse: webhookResponseStatus,
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
