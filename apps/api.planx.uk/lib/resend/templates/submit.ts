import type { EmailTemplate } from "./index.js";

export type SubmitTemplate = EmailTemplate<
  "submit",
  {
    serviceName: string;
    sessionId: string;
    applicantName: string;
    applicantEmail: string;
    address: string;
    projectType: string;
    fee: string;
    downloadLink: string;
  }
>;
