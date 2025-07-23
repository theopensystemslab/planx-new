import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/72e211e3-22d8-4a4a-8226-712a82768d86
 * @deprecated Temp testing template - do not merge to `main` or `production`
 */
export const saveTemplate: NotifyTemplate<Config> = {
  id: "72e211e3-22d8-4a4a-8226-712a82768d86",
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
