import type {
  GovUKPayment,
  Team,
  PaymentRequest,
} from "@opensystemslab/planx-core/types";

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
  name: string;
  data: {
    [key: string]: Node;
  };
  team_id: number;
  publishedFlows?:
    | {
        data: { [key: string]: Node };
      }[]
    | [];
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
}

export type Breadcrumb = Record<string, UserData>;

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
    name: string;
    team: Team;
  };
  lockedAt?: string;
  paymentRequests?: Pick<PaymentRequest, "id" | "payeeEmail" | "payeeName">[];
}

export type IsoDateString = string;
