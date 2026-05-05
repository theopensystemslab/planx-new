import { type NotifyConfig, type NotifyTemplate } from "../index.js";

/**
 * GovNotify application template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/0f5d1026-7a33-4054-ba35-9828a17df600
 */
export const newDownloadLinkTemplate: NotifyTemplate<Config> = {
  id: "0f5d1026-7a33-4054-ba35-9828a17df600",
  access: "private",
  config: {} as Config,
};

/**
 * GovNotify general template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/b9f88e08-7bed-46cb-ba02-ece12f2228d0
 */
export const generalNewDownloadLinkTemplate: NotifyTemplate<Config> = {
  id: "b9f88e08-7bed-46cb-ba02-ece12f2228d0",
  access: "private",
  config: {} as Config,
};

export type Config = NotifyConfig<{
  sessionId: string;
  downloadLink: string;
  serviceName: string;
}>;
