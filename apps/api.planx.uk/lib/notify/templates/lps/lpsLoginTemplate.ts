import { type NotifyConfig, type NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/701972a7-93c2-4888-b52b-9192fff37000
 */
export const lpsLoginTemplate: NotifyTemplate<Config> = {
  id: "701972a7-93c2-4888-b52b-9192fff37000",
  access: "hybrid",
  config: {} as Config,
};

export type Config = NotifyConfig<{
  magicLink: string;
}>;
