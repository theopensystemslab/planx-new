import { PaymentRequest } from "@opensystemslab/planx-core/dist/types";

export interface Node {
  id?: string;
  data?: Record<string, any>;
  edges?: Array<string>;
  type?: number;
}

export interface Flow {
  id: string;
  slug: string;
  data: {
    [key: string]: Node;
  };
  team_id: number;
}

export interface PublishedFlow {
  id: number;
  data: {
    [key: string]: Node;
  };
  created_at: string;
  flow_id: string;
  publisher_id: number;
  summary: string;
}

export interface UserData {
  answers?: Array<string>;
  data?: Record<string, any>;
  auto?: boolean;
  override?: Record<string, any>;
  feedback?: string;
}

export type Breadcrumb = Record<string, UserData>;

export interface Team {
  id: number;
  slug: string;
  name: string;
  domain?: string;
  notifyPersonalisation: {
    helpEmail: string;
    helpPhone: string;
    helpOpeningHours: string;
    emailReplyToId: string;
  };
}

export interface Passport {
  data: Record<string, any>;
}

export interface LowCalSession {
  data: {
    passport: Passport;
    breadcrumbs: Breadcrumb;
    govUkPayment?: GovUKPayment;
    id: string;
  };
  id: string;
  email: string;
  flow_id: string;
  created_at: string;
  updated_at: string;
  submitted_at: string | null;
  deleted_at: string | null;
  has_user_saved: boolean;
  flow: {
    slug: string;
  };
  lockedAt?: string;
  paymentRequests?: Pick<PaymentRequest, "id" | "payeeEmail" | "payeeName">[]
}

type MinimumNotifyPersonalisation = {
  emailReplyToId: string;
  expiryDate?: string;
  helpEmail: string;
  helpOpeningHours: string;
  helpPhone: string;
  serviceLink?: string;
  serviceName?: string;
  sessionId?: string;
};

interface SaveAndReturnNotifyPersonalisation
  extends MinimumNotifyPersonalisation {
  address?: any;
  projectType?: string;
  resumeLink?: string;
  teamName: string;
  reminderDays?: string;
}

export interface SaveAndReturnNotifyConfig {
  personalisation: SaveAndReturnNotifyPersonalisation;
}

interface EmailSubmissionNotifyPersonalisation
  extends MinimumNotifyPersonalisation {
  applicantEmail: string;
  downloadLink: string;
}

export interface EmailSubmissionNotifyConfig {
  personalisation: EmailSubmissionNotifyPersonalisation;
}

interface InviteToPayNotifyPersonalisation
  extends MinimumNotifyPersonalisation {
  address?: string;
  agentName?: string;
  fee?: string;
  payeeEmail: string;
  payeeName?: string;
  paymentLink?: string;
  paymentRequestId: string;
  projectType?: string;
  reminderDays?: string;
}

export interface InviteToPayNotifyConfig {
  personalisation: InviteToPayNotifyPersonalisation;
}

export interface AgentAndPayeeSubmissionNotifyPersonalisation
  extends MinimumNotifyPersonalisation {
  applicantName: string;
  payeeName: string;
  address: string;
  projectType: string;
}

export interface AgentAndPayeeSubmissionNotifyConfig {
  personalisation: AgentAndPayeeSubmissionNotifyPersonalisation;
}

export type NotifyConfig =
  | SaveAndReturnNotifyConfig
  | EmailSubmissionNotifyConfig
  | InviteToPayNotifyConfig
  | AgentAndPayeeSubmissionNotifyConfig;

// https://docs.payments.service.gov.uk/making_payments/#receiving-the-api-response
export interface GovUKPayment {
  amount: number;
  reference?: string;
  state: {
    // https://docs.payments.service.gov.uk/api_reference/#payment-status-meanings
    status:
      | "created"
      | "started"
      | "submitted"
      | "capturable"
      | "success"
      | "failed"
      | "cancelled"
      | "error";
    finished: boolean;
    message?: string;
  };
  payment_id: string;
  payment_provider: string;
  created_date?: string;
  _links?: {
    self: {
      href: string;
      method: string;
    };
    next_url?: {
      href: string;
      method: string;
    };
    next_url_post: {
      type: string;
      params: {
        chargeTokenId: string;
      };
      href: string;
      method: string;
    };
  };
}
