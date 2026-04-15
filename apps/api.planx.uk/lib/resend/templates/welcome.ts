import type { EmailTemplate } from "./index.js";

export type WelcomeTemplate = EmailTemplate<
  "welcome",
  {
    firstName: string;
    subscriptionStatus: "Active" | "Trial";
  }
>;
