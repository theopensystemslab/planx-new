import { Resend } from "resend";
import type { ResendTemplate, TemplateRegistry } from "./templates/index.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS || "PlanX <no-reply@opensystemslab.io>";

export const sendEmail = async <T extends ResendTemplate>(
  templateName: T,
  to: string,
  variables: TemplateRegistry[T]["variables"],
): Promise<{ message: string }> => {
  const { error } = await resend.emails.send({
    from: FROM_ADDRESS,
    to,
    template: {
      id: templateName,
      variables,
    },
  });

  if (error) {
    throw new Error(
      `Failed to send ${templateName} email using Resend: ${JSON.stringify(error)}`,
    );
  }

  return { message: `${templateName} email sent successfully` };
};
