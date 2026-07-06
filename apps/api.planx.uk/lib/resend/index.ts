import type { ErrorResponse } from "resend";
import { Resend } from "resend";

import type { ResendTemplate, TemplateRegistry } from "./templates/index.js";

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_ADDRESS =
  process.env.RESEND_FROM_ADDRESS || "PlanX <no-reply@opensystemslab.io>";

// Retrying on these errors can still succeed
// Any other errors will need a dev intervention somewhere before a retry
// Docs: https://resend.com/docs/api-reference/errors
const TRANSIENT_RESEND_CODES = new Set<ErrorResponse["name"]>([
  "application_error",
  "internal_server_error",
  "rate_limit_exceeded",
]);

export const sendEmail = async <T extends ResendTemplate>(
  templateName: T,
  to: string,
  variables: TemplateRegistry[T]["variables"],
  { idempotencyKey }: { idempotencyKey?: string } = {},
): Promise<{ message: string }> => {
  const { error } = await resend.emails.send(
    {
      from: FROM_ADDRESS,
      to,
      template: {
        id: templateName,
        variables,
      },
    },
    { idempotencyKey },
  );

  if (error) {
    const isTransient = TRANSIENT_RESEND_CODES.has(error.name);
    console.error("Resend send failed", {
      template: templateName,
      code: error.name,
      statusCode: error.statusCode,
      isTransient,
    });
    throw new Error(
      `Failed to send "${templateName}" email using Resend [${error.name}]: ${error.message}`,
    );
  }

  return { message: `${templateName} email sent successfully` };
};
