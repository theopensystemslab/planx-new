import type { UUID } from "crypto";
import {
  confirmationAgentTemplate,
  generalConfirmationAgentTemplate,
} from "./inviteToPay/confirmation-agent.js";
import {
  confirmationPayeeTemplate,
  generalConfirmationPayeeTemplate,
} from "./inviteToPay/confirmation-payee.js";
import {
  invitationToPayTemplate,
  generalInvitationToPayTemplate,
} from "./inviteToPay/invitation-to-pay.js";
import {
  invitationToPayAgentTemplate,
  generalInvitationToPayAgentTemplate,
} from "./inviteToPay/invitation-to-pay-agent.js";
import {
  paymentExpiryTemplate,
  generalPaymentExpiryTemplate,
} from "./inviteToPay/payment-expiry.js";
import {
  paymentExpiryAgentTemplate,
  generalPaymentExpiryAgentTemplate,
} from "./inviteToPay/payment-expiry-agent.js";
import {
  paymentReminderTemplate,
  generalPaymentReminderTemplate,
} from "./inviteToPay/payment-reminder.js";
import {
  paymentReminderAgentTemplate,
  generalPaymentReminderAgentTemplate,
} from "./inviteToPay/payment-reminder-agent.js";
import {
  expiryTemplate,
  generalExpiryTemplate,
} from "./saveAndReturn/expiry.js";
import {
  reminderTemplate,
  generalReminderTemplate,
} from "./saveAndReturn/reminder.js";
import {
  saveTemplate,
  generalSaveTemplate,
} from "./saveAndReturn/save-application.js";
import {
  userConfirmationTemplate,
  generalUserConfirmationTemplate,
} from "./saveAndReturn/user-confirmation.js";
import {
  resumeTemplate,
  generalResumeTemplate,
} from "./saveAndReturn/resume-application.js";
import { lpsLoginTemplate } from "./lps/lpsLoginTemplate.js";
import {
  newDownloadLinkTemplate,
  generalNewDownloadLinkTemplate,
} from "./sendToEmail/new-download-link.js";

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
  // Invite to pay — application
  "confirmation-agent": confirmationAgentTemplate,
  "confirmation-payee": confirmationPayeeTemplate,
  "invite-to-pay": invitationToPayTemplate,
  "invite-to-pay-agent": invitationToPayAgentTemplate,
  "payment-expiry": paymentExpiryTemplate,
  "payment-expiry-agent": paymentExpiryAgentTemplate,
  "payment-reminder": paymentReminderTemplate,
  "payment-reminder-agent": paymentReminderAgentTemplate,
  // Invite to pay — general
  "general-confirmation-agent": generalConfirmationAgentTemplate,
  "general-confirmation-payee": generalConfirmationPayeeTemplate,
  "general-invite-to-pay": generalInvitationToPayTemplate,
  "general-invite-to-pay-agent": generalInvitationToPayAgentTemplate,
  "general-payment-expiry": generalPaymentExpiryTemplate,
  "general-payment-expiry-agent": generalPaymentExpiryAgentTemplate,
  "general-payment-reminder": generalPaymentReminderTemplate,
  "general-payment-reminder-agent": generalPaymentReminderAgentTemplate,
  // Save & Return — application
  expiry: expiryTemplate,
  reminder: reminderTemplate,
  resume: resumeTemplate,
  save: saveTemplate,
  confirmation: userConfirmationTemplate,
  // Save & Return — general
  "general-expiry": generalExpiryTemplate,
  "general-reminder": generalReminderTemplate,
  "general-resume": generalResumeTemplate,
  "general-save": generalSaveTemplate,
  "general-confirmation": generalUserConfirmationTemplate,
  // Send to email — application
  "new-download-link": newDownloadLinkTemplate,
  // Send to email — general
  "general-new-download-link": generalNewDownloadLinkTemplate,
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
