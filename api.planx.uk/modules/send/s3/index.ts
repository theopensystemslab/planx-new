import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import type { NextFunction, Request, Response } from "express";
import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import type { Passport } from "../../../types.js";
import { uploadPrivateFile } from "../../file/service/uploadFile.js";
import { markSessionAsSubmitted } from "../../saveAndReturn/service/utils.js";
import { isApplicationTypeSupported } from "../utils/helpers.js";

interface CreateS3Application {
  insertS3Application: {
    id: string;
  };
}

const sendToS3 = async (req: Request, res: Response, next: NextFunction) => {
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

    // Send a notification with the file URL to the Power Automate webhook
    const webhookRequest: AxiosRequestConfig = {
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
    };
    const webhookResponse = await axios(webhookRequest)
      .then(async (res) => {
        // Mark session as submitted so that reminder and expiry emails are not triggered
        markSessionAsSubmitted(sessionId);

        // Create an audit entry
        const applicationId = await $api.client.request<CreateS3Application>(
          gql`
            mutation CreateS3Application(
              $session_id: String!
              $team_slug: String!
              $webhook_request: jsonb!
              $webhook_response: jsonb = {}
            ) {
              insertS3Application: insert_s3_applications_one(
                object: {
                  session_id: $session_id
                  team_slug: $team_slug
                  webhook_request: $webhook_request
                  webhook_response: $webhook_response
                }
              ) {
                id
              }
            }
          `,
          {
            session_id: sessionId,
            team_slug: localAuthority,
            webhook_request: webhookRequest,
            webhook_response: {
              status: res.status,
              statusText: res.statusText,
              headers: res.headers,
              config: res.config,
              data: res.data,
            },
          },
        );

        return {
          id: applicationId.insertS3Application?.id,
          axiosResponse: res,
        };
      })
      .catch((error) => {
        throw new Error(
          `Failed to send submission notification to ${localAuthority}'s Power Automate Webhook (${sessionId}): ${error}`,
        );
      });

    res.status(200).send({
      message: `Successfully uploaded submission to S3: ${fileUrl}`,
      payload: doValidation ? "Validated ODP Schema" : "Discretionary",
      webhookResponse: webhookResponse.axiosResponse.status,
      auditEntryId: webhookResponse.id,
    });
  } catch (error) {
    return next({
      error,
      message: `Failed to upload submission to S3 (${localAuthority}): ${
        (error as Error).message
      }`,
    });
  }
};

export { sendToS3 };
