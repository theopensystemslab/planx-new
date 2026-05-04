import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify application template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/43be4c11-a406-4381-b2be-056a1127455d
 */
export const reminderTemplate: NotifyTemplate<Config> = {
  id: "43be4c11-a406-4381-b2be-056a1127455d",
  access: "private",
  config: {} as Config,
};

/**
 * GovNotify general template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/f1f968b2-c173-438e-bfd2-d149093580ca
 */
export const genericReminderTemplate: NotifyTemplate<GeneralConfig> = {
  id: "f1f968b2-c173-438e-bfd2-d149093580ca",
  access: "private",
  config: {} as GeneralConfig,
};

type Config = NotifyConfig<
  EmailFooter & {
    serviceName: string;
    sessionId: string;
    address: string;
    projectType: string;
    expiryDate: string;
    resumeLink: string;
  }
>;

type GeneralConfig = Omit<Config, "personalisation"> & {
  personalisation: Omit<Config["personalisation"], "projectType">;
};
