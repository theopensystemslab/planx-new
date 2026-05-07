import { NotifyClient } from "notifications-node-client";
import { $api, $public } from "../../client/index.js";
import {
  templateRegistry,
  type Template,
  type TemplateRegistry,
} from "./templates/index.js";

export type GovNotifyEmailTemplate = "application" | "general";

const GENERAL_TEMPLATE_MAP: Partial<Record<Template, Template>> = {
  save: "general-save",
  reminder: "general-reminder",
  expiry: "general-expiry",
  confirmation: "general-confirmation",
  resume: "general-resume",
  "invite-to-pay": "general-invite-to-pay",
  "invite-to-pay-agent": "general-invite-to-pay-agent",
  "payment-reminder": "general-payment-reminder",
  "payment-reminder-agent": "general-payment-reminder-agent",
  "payment-expiry": "general-payment-expiry",
  "payment-expiry-agent": "general-payment-expiry-agent",
  "confirmation-agent": "general-confirmation-agent",
  "confirmation-payee": "general-confirmation-payee",
  "new-download-link": "general-new-download-link",
};

export const resolveNotifyTemplate = (
  base: Template,
  emailTemplate: GovNotifyEmailTemplate,
): Template =>
  emailTemplate === "general" ? (GENERAL_TEMPLATE_MAP[base] ?? base) : base;

const notifyClient = new NotifyClient(process.env.GOVUK_NOTIFY_API_KEY);

export type SendEmail = <T extends Template>(
  template: T,
  emailAddress: string,
  config: TemplateRegistry[T]["config"],
) => Promise<{ message: string; expiryDate?: string }>;

/**
 * Send email using the GovUK Notify client
 */
const sendEmail: SendEmail = async (template, emailAddress, config) => {
  const templateId = templateRegistry[template].id;
  if (!templateId) throw new Error("Template ID is required");

  try {
    await notifyClient.sendEmail(templateId, emailAddress, config);
    const returnValue: {
      message: string;
      expiryDate?: string;
    } = { message: "Success" };

    if (template === "save" || template === "general-save") {
      const saveConfig = config as TemplateRegistry["save"]["config"];
      returnValue.expiryDate = saveConfig.personalisation.expiryDate;
    }

    return returnValue;
  } catch (error: any) {
    const notifyError = error?.response?.data?.errors?.length
      ? JSON.stringify(error?.response?.data?.errors?.[0])
      : error?.message;
    throw Error(
      `Error: Failed to send email using Notify client. Details: ${JSON.stringify(
        {
          notifyError,
          config,
          template,
        },
      )}`,
    );
  }
};

const getClientForTemplate = (template: Template) =>
  templateRegistry[template].access === "private"
    ? $api.client
    : $public.client;

export { sendEmail, getClientForTemplate };
