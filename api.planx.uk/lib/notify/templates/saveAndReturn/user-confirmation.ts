import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/6a14c8c9-09a3-4cdd-9f63-bf05d0594137
 * @deprecated Temp testing template - do not merge to `main` or `production`
 */
export const userConfirmationTemplate: NotifyTemplate<Config> = {
  id: "6a14c8c9-09a3-4cdd-9f63-bf05d0594137",
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
