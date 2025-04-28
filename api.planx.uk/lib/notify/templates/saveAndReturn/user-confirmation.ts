import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/8b82b606-defa-4daa-8fdb-e78b852b8ffb
 */
export const userConfirmationTemplate: NotifyTemplate<Config> = {
  id: "8b82b606-defa-4daa-8fdb-e78b852b8ffb",
  access: "private",
  config: {} as Config,
};

export type Config = NotifyConfig<
  EmailFooter & {
    serviceName: string;
    sessionId: string;
    address: string;
    projectType: string;
  }
>;
