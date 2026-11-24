import type { EmailTemplate } from "./index.js";

/**
 * Daily remittance emails to councils
 */
export type RemittanceTemplate = EmailTemplate<
  "remittance",
  {
    team: string;
    date: string;
  }
>;
