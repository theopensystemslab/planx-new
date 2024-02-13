import { PaymentRequest } from "@opensystemslab/planx-core/dist/types";
import { GovUKPayment } from "@opensystemslab/planx-core/types";

/**
 * @deprecated Migrating to Node from planx-core
 */
export interface Node {
  id?: string;
  data?: Record<string, any>;
  edges?: Array<string>;
  type?: number;
}

/**
 * @deprecated Migrating to Flow and FlowGraph from planx-core
 */
export interface Flow {
  id: string;
  slug: string;
  data: {
    [key: string]: Node;
  };
  team_id: number;
  publishedFlows?: {
    data: { [key: string]: Node; }
  }[] | [];
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
  boundaryBBox?: object;
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

export interface LowCalSessionData {
  passport: Passport;
  breadcrumbs: Breadcrumb;
  govUkPayment?: GovUKPayment;
  id: string;
}

export interface LowCalSession {
  data: LowCalSessionData;
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
    team: Team;
  };
  lockedAt?: string;
  paymentRequests?: Pick<PaymentRequest, "id" | "payeeEmail" | "payeeName">[];
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
  address?: string;
  projectType?: string;
  resumeLink?: string;
  teamName: string;
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
