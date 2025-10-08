import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/428c4dfd-a70b-44d6-9f81-b4f833d80405
 */
export const saveTemplate: NotifyTemplate<Config> = {
  id: "428c4dfd-a70b-44d6-9f81-b4f833d80405",
  access: "public",
  config: {} as Config,
};

export type Config = NotifyConfig<
  EmailFooter & {
    serviceName: string;
    sessionId: string;
    address: string;
    projectType: string;
    expiryDate: string;
    resumeLink: string;
  }
>;
