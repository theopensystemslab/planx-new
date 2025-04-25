import { type NotifyConfig, type NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/7e77bdae-7379-4dd8-a8cc-086a0029163c
 */
export const submitTemplate: NotifyTemplate<Config> = {
  id: "7e77bdae-7379-4dd8-a8cc-086a0029163c",
  access: "private",
  config: {} as Config,
};

export type Config = NotifyConfig<{
  serviceName: string;
  sessionId: string;
  applicantEmail: string;
  downloadLink: string;
}>;
