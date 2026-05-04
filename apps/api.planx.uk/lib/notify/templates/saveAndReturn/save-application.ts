import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify application template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/428c4dfd-a70b-44d6-9f81-b4f833d80405
 */
export const saveTemplate: NotifyTemplate<Config> = {
  id: "428c4dfd-a70b-44d6-9f81-b4f833d80405",
  access: "public",
  config: {} as Config,
};

/**
 * GovNotify generic template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/98db65ed-df94-4859-875a-e15f2fe8b9ec
 */
export const genericSaveTemplate: NotifyTemplate<GenericConfig> = {
  id: "98db65ed-df94-4859-875a-e15f2fe8b9ec",
  access: "public",
  config: {} as GenericConfig,
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

type GenericConfig = Omit<Config, "personalisation"> & {
  personalisation: Omit<Config["personalisation"], "projectType">;
};
