import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify application template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/8b82b606-defa-4daa-8fdb-e78b852b8ffb
 */
export const userConfirmationTemplate: NotifyTemplate<Config> = {
  id: "8b82b606-defa-4daa-8fdb-e78b852b8ffb",
  access: "private",
  config: {} as Config,
};

/**
 * GovNotify generic template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/7171a340-5e63-471e-8994-0bdec45baf42
 */
export const genericUserConfirmationTemplate: NotifyTemplate<GenericConfig> = {
  id: "7171a340-5e63-471e-8994-0bdec45baf42",
  access: "private",
  config: {} as GenericConfig,
};

type Config = NotifyConfig<
  EmailFooter & {
    serviceName: string;
    sessionId: string;
    address: string;
    projectType: string;
  }
>;

type GenericConfig = Omit<Config, "personalisation"> & { 
  personalisation: Omit<Config["personalisation"], "projectType">
};
