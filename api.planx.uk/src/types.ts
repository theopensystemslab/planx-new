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
}

export interface UserData {
  answers?: Array<string>;
  data?: Record<string, any>;
  auto?: boolean;
  feedback?: string;
}

export type Breadcrumb = Record<string, UserData>;

export interface Team {
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
  data?: Record<string, any>;
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

export interface NotifyConfig {
  personalisation: {
    address?: any;
    projectType?: string;
    id?: string;
    expiryDate?: string;
    helpEmail: string;
    helpPhone: string;
    helpOpeningHours: string;
    emailReplyToId: string;
    resumeLink?: string;
    serviceLink?: string;
    serviceName?: string;
    teamName: string;
  };
  reference?: any;
  emailReplyToId?: any;
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
