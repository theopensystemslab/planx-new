import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/9619f89d-5d33-4cb0-a365-42c431ea9db3
 */
export const expiryTemplate: NotifyTemplate<Config> = {
  id: "9619f89d-5d33-4cb0-a365-42c431ea9db3",
  access: "private",
  config: {} as Config,
};

type Config = NotifyConfig<
  EmailFooter & {
    serviceName: string;
    sessionId: string;
    address: string;
    projectType: string;
    serviceLink: string;
  }
>;
