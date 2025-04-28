import { type NotifyConfig, type NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/0c8e8b26-01cd-4896-91e6-12c38ef25387
 */
export const confirmationPayeeTemplate: NotifyTemplate<Config> = {
  id: "0c8e8b26-01cd-4896-91e6-12c38ef25387",
  access: "private",
  config: {} as Config,
};

export type Config = NotifyConfig<{
  serviceName: string;
  sessionId: string;
  address: string;
  projectType: string;
  applicantName: string;
  helpEmail: string;
  helpOpeningHours: string;
  helpPhone: string;
}>;
