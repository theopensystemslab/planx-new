import { NotifyClient } from "notifications-node-client";
import { softDeleteSession } from "../../modules/saveAndReturn/service/utils";
import { NotifyConfig } from "../../types";
import { $api, $public } from "../../client";

const notifyClient = new NotifyClient(process.env.GOVUK_NOTIFY_API_KEY);

/**
 * Triggered by applicants when saving
 * Validated using email address & sessionId
 */
const publicEmailTemplates = {
  save: "428c4dfd-a70b-44d6-9f81-b4f833d80405",
} as const;

/**
 * Triggered by applicants when resuming
 * Validated using email address & inbox (magic link)
 */
const hybridEmailTemplates = {
  resume: "c7202e07-08cf-468e-a6a4-ac528d60d2f7",
} as const;

/**
 * Triggered by Hasura scheduled events
 * Validated with the useHasuraAuth() middleware
 */
const privateEmailTemplates = {
  reminder: "43be4c11-a406-4381-b2be-056a1127455d",
  expiry: "9619f89d-5d33-4cb0-a365-42c431ea9db3",
  submit: "7e77bdae-7379-4dd8-a8cc-086a0029163c",
  confirmation: "8b82b606-defa-4daa-8fdb-e78b852b8ffb",
  "confirmation-agent": "a030e73f-b708-4208-80d3-f1ea97723479",
  "confirmation-payee": "0c8e8b26-01cd-4896-91e6-12c38ef25387",
  "invite-to-pay": "7bdbc880-4f4e-400b-a838-74de401dfa92",
  "invite-to-pay-agent": "a964d10a-5442-42fa-b94b-b6623450cd68",
  "payment-reminder": "3208bf39-152d-4259-9064-ef5e192aeaa6",
  "payment-reminder-agent": "de02ca5c-fc1e-4360-8848-1f413bbd39e9",
  "payment-expiry": "825d51cf-f018-46c7-b381-81472c9507f7",
  "payment-expiry-agent": "92d9756b-d0ca-4d72-82c8-886c7af492fd",
} as const;

const emailTemplates = {
  ...publicEmailTemplates,
  ...hybridEmailTemplates,
  ...privateEmailTemplates,
} as const;

export type Template = keyof typeof emailTemplates;

/**
 * Send email using the GovUK Notify client
 */
const sendEmail = async (
  template: Template,
  emailAddress: string,
  config: NotifyConfig,
) => {
  const templateId = emailTemplates[template];
  if (!templateId) throw new Error("Template ID is required");

  try {
    await notifyClient.sendEmail(templateId, emailAddress, config);
    const returnValue: {
      message: string;
      expiryDate?: string;
    } = { message: "Success" };
    if (template === "expiry")
      await softDeleteSession(config.personalisation.sessionId!);
    if (template === "save")
      returnValue.expiryDate = config.personalisation.expiryDate;
    return returnValue;
  } catch (error: any) {
    const notifyError = error?.response?.data?.errors?.length
      ? JSON.stringify(error?.response?.data?.errors?.[0])
      : error?.message;
    throw Error(
      `Error: Failed to send email using Notify client. ${notifyError}`,
    );
  }
};

const getClientForTemplate = (template: Template) =>
  template in privateEmailTemplates ? $api.client : $public.client;

export { sendEmail, getClientForTemplate };
