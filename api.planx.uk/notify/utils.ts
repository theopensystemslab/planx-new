import { GraphQLClient } from "graphql-request";
import { NotifyClient } from "notifications-node-client";
import {
  adminGraphQLClient as adminClient,
  publicGraphQLClient as publicClient,
} from "../hasura";
import { softDeleteSession } from "../saveAndReturn/utils";
import { EmailSubmissionNotifyConfig, InviteToPayNotifyConfig, SaveAndReturnNotifyConfig } from "../types";

const notifyClient = new NotifyClient(process.env.GOVUK_NOTIFY_API_KEY);

/**
 * Triggered by applicants when saving
 * Validated using email address & sessionId
 */
const publicEmailTemplates = {
  save: "428c4dfd-a70b-44d6-9f81-b4f833d80405",
};

/**
 * Triggered by applicants when resuming
 * Validated using email address & inbox (magic link)
 */
const hybridEmailTemplates = {
  resume: "c7202e07-08cf-468e-a6a4-ac528d60d2f7",
};

/**
 * Triggered by Hasura scheduled events
 * Validated with the useHasuraAuth() middleware
 */
const privateEmailTemplates = {
  reminder: "43be4c11-a406-4381-b2be-056a1127455d",
  expiry: "9619f89d-5d33-4cb0-a365-42c431ea9db3",
  confirmation: "8b82b606-defa-4daa-8fdb-e78b852b8ffb",
  submit: "7e77bdae-7379-4dd8-a8cc-086a0029163c",
  "invite-to-pay": "7bdbc880-4f4e-400b-a838-74de401dfa92",
  "invite-to-pay-agent": "a964d10a-5442-42fa-b94b-b6623450cd68",
  "payment-reminder": "3208bf39-152d-4259-9064-ef5e192aeaa6",
  "payment-reminder-agent": "de02ca5c-fc1e-4360-8848-1f413bbd39e9",
  "payment-expiry": "825d51cf-f018-46c7-b381-81472c9507f7",
  "payment-expiry-agent": "92d9756b-d0ca-4d72-82c8-886c7af492fd",
};

const emailTemplates = {
  ...publicEmailTemplates,
  ...hybridEmailTemplates,
  ...privateEmailTemplates,
};

export type Template = keyof typeof emailTemplates;

/**
 * Send email using the GovUK Notify client
 */
const sendEmail = async (
  template: Template,
  emailAddress: string,
  config: SaveAndReturnNotifyConfig | EmailSubmissionNotifyConfig | InviteToPayNotifyConfig
) => {
  const templateId = emailTemplates[template];
  if (!templateId) throw new Error("Template ID is required");

  try {
    await notifyClient.sendEmail(templateId, emailAddress, config);
    const returnValue: {
      message: string;
      expiryDate?: string;
    } = { message: "Success" };
    if (template === "expiry") softDeleteSession(config.personalisation.id!);
    if (template === "save")
      returnValue.expiryDate = config.personalisation.expiryDate;
    return returnValue;
  } catch (error: any) {
    const notifyError = JSON.stringify(error.response.data.errors[0]);
    throw Error(
      `Error: Failed to send email using Notify client. ${notifyError}`
    );
  }
};

const getClientForTemplate = (template: Template): GraphQLClient =>
  template in privateEmailTemplates ? adminClient : publicClient;
 
export {
  sendEmail,
  getClientForTemplate,
};
