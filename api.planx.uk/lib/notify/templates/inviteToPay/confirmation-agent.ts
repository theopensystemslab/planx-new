import { type NotifyConfig, type NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/a030e73f-b708-4208-80d3-f1ea97723479
 */
export const confirmationAgentTemplate: NotifyTemplate<Config> = {
  id: "a030e73f-b708-4208-80d3-f1ea97723479",
  access: "private",
  config: {} as Config,
};

type Config = NotifyConfig<{
  serviceName: string;
  payeeName: string;
  sessionId: string;
  address: string;
  projectType: string;
  helpEmail: string;
  helpOpeningHours: string;
  helpPhone: string;
}>;
