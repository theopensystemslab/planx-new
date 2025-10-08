import { NotifyClient } from "notifications-node-client";
import { softDeleteSession } from "../../modules/saveAndReturn/service/utils.js";
import { $api, $public } from "../../client/index.js";
import {
  templateRegistry,
  type Template,
  type TemplateRegistry,
} from "./templates/index.js";

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

    if (template === "expiry") {
      const expiryConfig = config as TemplateRegistry["expiry"]["config"];
      await softDeleteSession(expiryConfig.personalisation.sessionId);
    }

    if (template === "save") {
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
