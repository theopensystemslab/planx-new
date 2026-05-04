import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify application template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/c7202e07-08cf-468e-a6a4-ac528d60d2f7
 */
export const resumeTemplate: NotifyTemplate<Config> = {
  id: "c7202e07-08cf-468e-a6a4-ac528d60d2f7",
  access: "hybrid",
  config: {} as Config,
};

/**
 * GovNotify generic template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/9de575a7-1e03-426b-ace7-9e8ed79874cf
 */
export const genericResumeTemplate: NotifyTemplate<Config> = {
  id: "9de575a7-1e03-426b-ace7-9e8ed79874cf",
  access: "hybrid",
  config: {} as Config,
};

type Config = NotifyConfig<
  EmailFooter & {
    teamName: string;
    content: string;
  }
>;
