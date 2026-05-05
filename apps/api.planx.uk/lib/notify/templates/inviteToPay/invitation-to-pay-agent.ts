import type { EmailFooter, NotifyConfig, NotifyTemplate } from "../index.js";

/**
 * GovNotify application template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/a964d10a-5442-42fa-b94b-b6623450cd68
 */
export const invitationToPayAgentTemplate: NotifyTemplate<Config> = {
  id: "a964d10a-5442-42fa-b94b-b6623450cd68",
  access: "private",
  config: {} as Config,
};

/**
 * GovNotify general template: https://www.notifications.service.gov.uk/services/012e65af-0eb2-45d5-87bd-4248354c4c22/templates/c84719e8-4259-4ec9-a604-62debf742027
 */
export const generalInvitationToPayAgentTemplate: NotifyTemplate<Config> = {
  id: "c84719e8-4259-4ec9-a604-62debf742027",
  access: "private",
  config: {} as Config,
};

export type Config = NotifyConfig<
  EmailFooter & {
    payeeName: string;
    serviceName: string;
    sessionId: string;
    fee: string;
    address: string;
    projectType: string;
    expiryDate: string;
    paymentLink: string;
  }
>;
