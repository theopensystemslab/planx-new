import { type NotifyConfig, type NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/43be4c11-a406-4381-b2be-056a1127455d
 */
export const reminderTemplate: NotifyTemplate<Config> = {
  id: "43be4c11-a406-4381-b2be-056a1127455d",
  access: "private",
  config: {} as Config,
};

export type Config = NotifyConfig<{
  serviceName: string;
  sessionId: string;
  address: string;
  projectType: string;
  expiryDate: string;
  resumeLink: string;
  helpEmail: string;
  helpOpeningHours: string;
  helpPhone: string;
}>;
