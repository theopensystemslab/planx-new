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
}

// Minimum personalisation config shared across all applicant-facing Notify templates
interface MinimumNotifyPersonalisation {
  id: string; // sessionId
  serviceName: string;
  emailReplyToId: string;
  helpEmail: string;
  helpOpeningHours: string;
  helpPhone: string;
}

interface InviteToPayNotifyPersonalisation extends MinimumNotifyPersonalisation {
  paymentRequestId: string;
  payeeEmail: string;
  payeeName?: string;
  agentName?: string;
  paymentLink?: string;
  fee?: string;
  projectType?: string;
  address?: any;
  expiryDate?: string;
}

export interface InviteToPayNotifyConfig {
  personalisation: InviteToPayNotifyPersonalisation;
}

interface SaveAndReturnNotifyPersonalisation extends MinimumNotifyPersonalisation {
  teamName: string;
  serviceLink?: string;
  resumeLink?: string;
  projectType?: string;
  address?: any;
  expiryDate?: string;
}

export interface SaveAndReturnNotifyConfig {
  personalisation: SaveAndReturnNotifyPersonalisation;
}

export interface EmailSubmissionNotifyConfig {
  personalisation: {
    applicantEmail: string;
    downloadLink: string;
    emailReplyToId: string;
    expiryDate?: string;
    id?: string;
    serviceName: string;
    sessionId: string;
  };
}

// https://docs.payments.service.gov.uk/making_payments/#receiving-the-api-response
export interface GovUKPayment {
  amount: number;
  reference?: string;
  state: {
    // https://docs.payments.service.gov.uk/api_reference/#status-and-finished
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
  };
  payment_id: string;
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
