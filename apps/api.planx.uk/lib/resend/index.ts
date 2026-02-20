import { Resend } from "resend";
import {
  templateRegistry,
  type ResendTemplate,
  type TemplateParams,
} from "./templates/index.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS || "PlanX <no-reply@opensystemslab.io>";

export const sendEmail = async (
  payload: TemplateParams & { template: ResendTemplate },
): Promise<{ message: string }> => {
  const { template: templateName, email, firstName, lastName } = payload;
  const template = templateRegistry[templateName];

  if (!template) {
    throw new Error(`Undefined email template: ${templateName}`);
  }

  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to: email,
    subject: template.subject,
    html: template.html({ firstName, lastName, email }),
  });

  if (error) {
    throw new Error(
      `Failed to send ${templateName} email using Resend: ${JSON.stringify(error)}`,
    );
  }

  return { message: `${templateName} email sent successfully` };
};
