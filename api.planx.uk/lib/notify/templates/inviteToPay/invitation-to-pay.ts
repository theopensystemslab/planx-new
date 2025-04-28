import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/7bdbc880-4f4e-400b-a838-74de401dfa92
 */
export const invitationToPayTemplate: NotifyTemplate<Config> = {
  id: "7bdbc880-4f4e-400b-a838-74de401dfa92",
  access: "private",
  config: {} as Config,
};

export type Config = NotifyConfig<
  EmailFooter & {
    agentName: string;
    serviceName: string;
    sessionId: string;
    fee: string;
    address: string;
    projectType: string;
    expiryDate: string;
    paymentLink: string;
  }
>;
