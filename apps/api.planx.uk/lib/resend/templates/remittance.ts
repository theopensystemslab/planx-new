import type { EmailTemplate } from "./index.js";

/**
 * Daily remittance emails to councils
 */
export type RemittanceTemplate = EmailTemplate<
  "remittance",
  {
    date: string;
    team: string;
    total: number;
    transactions: number;
  }
>;
