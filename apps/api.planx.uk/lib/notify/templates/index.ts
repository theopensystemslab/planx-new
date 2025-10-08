import type { UUID } from "crypto";
import { confirmationAgentTemplate } from "./inviteToPay/confirmation-agent.js";
import { confirmationPayeeTemplate } from "./inviteToPay/confirmation-payee.js";
import { invitationToPayTemplate } from "./inviteToPay/invitation-to-pay.js";
import { invitationToPayAgentTemplate } from "./inviteToPay/invitation-to-pay-agent.js";
import { paymentExpiryTemplate } from "./inviteToPay/payment-expiry.js";
import { paymentExpiryAgentTemplate } from "./inviteToPay/payment-expiry-agent.js";
import { paymentReminderTemplate } from "./inviteToPay/payment-reminder.js";
import { paymentReminderAgentTemplate } from "./inviteToPay/payment-reminder-agent.js";
import { expiryTemplate } from "./saveAndReturn/expiry.js";
import { reminderTemplate } from "./saveAndReturn/reminder.js";
import { saveTemplate } from "./saveAndReturn/save-application.js";
import { userConfirmationTemplate } from "./saveAndReturn/user-confirmation.js";
import { resumeTemplate } from "./saveAndReturn/resume-application.js";
import { submitTemplate } from "./sendToEmail/submit-application.js";
import { lpsLoginTemplate } from "./lps/lpsLoginTemplate.js";

export type NotifyConfig<T> = { personalisation: T; emailReplyToId: string };

export type Access =
  /**
   * Triggered by Hasura scheduled events
   * Validated with the useHasuraAuth() middleware
   */
  | "private"
  /**
   * Triggered by applicants when saving
   * Validated using email address & sessionId
   */
  | "public"
  /**
   * Triggered by applicants when resuming
   * Validated using email address & inbox (magic link)
   */
  | "hybrid";

/**
 * Describes a template managed on GovNotify
 */
export interface NotifyTemplate<T> {
  id: UUID;
  access: Access;
  config: T;
}

export const templateRegistry = {
  // Invite to pay
  "confirmation-agent": confirmationAgentTemplate,
  "confirmation-payee": confirmationPayeeTemplate,
  "invite-to-pay": invitationToPayTemplate,
  "invite-to-pay-agent": invitationToPayAgentTemplate,
  "payment-expiry": paymentExpiryTemplate,
  "payment-expiry-agent": paymentExpiryAgentTemplate,
  "payment-reminder": paymentReminderTemplate,
  "payment-reminder-agent": paymentReminderAgentTemplate,
  // Save & Return
  expiry: expiryTemplate,
  reminder: reminderTemplate,
  resume: resumeTemplate,
  save: saveTemplate,
  confirmation: userConfirmationTemplate,
  // Send to email
  submit: submitTemplate,
  // localplanning.services
  "lps-login": lpsLoginTemplate,
} as const;

export type TemplateRegistry = typeof templateRegistry;

export type Template = keyof TemplateRegistry;

export type EmailFooter = {
  helpEmail: string;
  helpOpeningHours: string;
  helpPhone: string;
};

/** Fallback reply to ID, points to devops+govuknotify@opensystemslab.io */
export const DEVOPS_EMAIL_REPLY_TO_ID =
  "727d48fa-cb8a-42f9-b8b2-55032f3bb451" as const;
