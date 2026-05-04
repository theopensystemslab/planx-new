import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify application template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/9619f89d-5d33-4cb0-a365-42c431ea9db3
 */
export const expiryTemplate: NotifyTemplate<Config> = {
  id: "9619f89d-5d33-4cb0-a365-42c431ea9db3",
  access: "private",
  config: {} as Config,
};

/**
 * GovNotify general template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/b38532ea-9808-4367-b53d-3317d2389f8a
 */
export const genericExpiryTemplate: NotifyTemplate<GeneralConfig> = {
  id: "b38532ea-9808-4367-b53d-3317d2389f8a",
  access: "private",
  config: {} as GeneralConfig,
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

type GeneralConfig = Omit<Config, "personalisation"> & {
  personalisation: Omit<Config["personalisation"], "projectType">;
};
