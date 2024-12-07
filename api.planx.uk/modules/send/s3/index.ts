import type { AxiosRequestConfig } from "axios";
import axios from "axios";
import { gql } from "graphql-request";

import { $api } from "../../../client/index.js";
import type { Passport } from "../../../types.js";
import { uploadPrivateFile } from "../../file/service/uploadFile.js";
import { markSessionAsSubmitted } from "../../saveAndReturn/service/utils.js";
import { isApplicationTypeSupported } from "../utils/helpers.js";
import type { SendIntegrationController } from "../types.js";
import { convertObjectToMulterJSONFile } from "../../file/service/utils.js";

interface CreateS3Application {
  insertS3Application: {
    id: string;
  };
}

const sendToS3: SendIntegrationController = async (_req, res, next) => {
  const {
    payload: { sessionId },
  } = res.locals.parsedReq.body;
  const localAuthority = res.locals.parsedReq.params.localAuthority;
  const env =
    process.env.APP_ENVIRONMENT === "production" ? "production" : "staging";

  try {
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
    const flowName = session?.flow?.name;

    // Generate the ODP Schema JSON, skipping validation if not a supported application type
    const skipValidation = !isApplicationTypeSupported(passport);
    const exportData = await $api.export.digitalPlanningDataPayload(
      sessionId,
      skipValidation,
    );

    // Create and upload the data as an S3 file
    const filename = `${sessionId}.json`;
    const file = convertObjectToMulterJSONFile(exportData, filename);
    const { fileUrl } = await uploadPrivateFile(file, filename);

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
        service: flowName,
        environment: env,
        file: fileUrl,
        payload: skipValidation ? "Discretionary" : "Validated ODP Schema",
      },
    };

    const webhookResponse = await axios(webhookRequest).catch((error) => {
      throw new Error(
        `Failed to send submission notification to ${localAuthority}'s Power Automate Webhook (${sessionId}): ${error}`,
      );
    });

    // Mark session as submitted so that reminder and expiry emails are not triggered
    markSessionAsSubmitted(sessionId);

    // Create an audit entry
    const {
      insertS3Application: { id: auditEntryId },
    } = await $api.client.request<CreateS3Application>(
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
          status: webhookResponse.status,
          statusText: webhookResponse.statusText,
          headers: webhookResponse.headers,
          config: webhookResponse.config,
          data: webhookResponse.data,
        },
      },
    );

    res.status(200).send({
      message: `Successfully uploaded submission to S3: ${fileUrl}`,
      payload: skipValidation ? "Discretionary" : "Validated ODP Schema",
      webhookResponse: webhookResponse.status,
      auditEntryId,
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
