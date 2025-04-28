import { type NotifyConfig, type NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/2c61750b-3ecc-4726-9ee2-e67fd523954f
 */
export const submitTemplate: NotifyTemplate<Config> = {
  id: "2c61750b-3ecc-4726-9ee2-e67fd523954f",
  access: "private",
  config: {} as Config,
};

export type Config = NotifyConfig<{
  serviceName: string;
  sessionId: string;
  applicantEmail: string;
  downloadLink: string;
  address: string;
  fee: string;
  projectType: string;
  applicantName: string;
}>;
