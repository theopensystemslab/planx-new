import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify application template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/a030e73f-b708-4208-80d3-f1ea97723479
 */
export const confirmationAgentTemplate: NotifyTemplate<Config> = {
  id: "a030e73f-b708-4208-80d3-f1ea97723479",
  access: "private",
  config: {} as Config,
};

/**
 * GovNotify general template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/f90d1d39-1dda-4ec3-978a-265a1ab26825
 */
export const generalConfirmationAgentTemplate: NotifyTemplate<Config> = {
  id: "f90d1d39-1dda-4ec3-978a-265a1ab26825",
  access: "private",
  config: {} as Config,
};

type Config = NotifyConfig<
  EmailFooter & {
    serviceName: string;
    payeeName: string;
    sessionId: string;
    address: string;
    projectType: string;
  }
>;
