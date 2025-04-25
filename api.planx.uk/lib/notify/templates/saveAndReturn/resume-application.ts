import { type NotifyConfig, type NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/c7202e07-08cf-468e-a6a4-ac528d60d2f7
 */
export const resumeTemplate: NotifyTemplate<Config> = {
  id: "c7202e07-08cf-468e-a6a4-ac528d60d2f7",
  access: "hybrid",
  config: {} as Config,
};

export type Config = NotifyConfig<{
  teamName: string;
  content: string;
  helpEmail: string;
  helpOpeningHours: string;
  helpPhone: string;
}>;
