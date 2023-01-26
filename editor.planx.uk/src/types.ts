import { useFormik } from "formik";

import { Store } from "./pages/FlowEditor/lib/store/index";
import { SharedStore } from "./pages/FlowEditor/lib/store/shared";

export type Maybe<T> = T | undefined;

export type FormikHookReturn = ReturnType<typeof useFormik>;

export interface Flow {
  id: string;
  slug: string;
  team: Team;
  settings?: FlowSettings;
}

export interface Team {
  name: string;
  slug: string;
  settings?: TeamSettings;
  theme?: TeamTheme;
}

export interface TeamTheme {
  primary?: string;
  logo?: string;
}

export interface TeamSettings {
  design?: {
    color?: string;
  };
  homepage?: string;
  externalPlanningSite: {
    name: string;
    url: string;
  };
  supportEmail?: string;
}

export interface GlobalSettings {
  footerContent?: { [key: string]: TextContent };
}

export const FOOTER_ITEMS = ["privacy", "help"];

const FLOW_SETTINGS = [...FOOTER_ITEMS, "legalDisclaimer"] as const;
export interface FlowSettings {
  elements?: {
    [key in typeof FLOW_SETTINGS[number]]?: TextContent;
  };
}

export interface TextContent {
  heading: string;
  content: string;
  show: boolean;
}

export interface Flag {
  category: string;
  value?: string;
  text: string;
  bgColor: string;
  color: string;
  // XXX: will be removed when flags are more dynamic. For the immediate future
  //      it's convenient to store a definition for BOPS users with the data.
  officerDescription?: string;
}

export interface Node {
  id: string;
  data: {
    text: string;
    flag?: string;
    info?: string;
    policyRef?: string;
  };
}

// https://docs.payments.service.gov.uk/making_payments/#receiving-the-api-response
export interface GovUKPayment {
  amount: number;
  reference: string;
  state: {
    status: PaymentStatus;
    finished: boolean;
  };
  payment_id: string;
  created_date: string;
  _links: {
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

export enum PaymentStatus {
  created = "created",
  started = "started",
  submitted = "submitted",
  capturable = "capturable",
  success = "success",
  failed = "failed",
  cancelled = "cancelled",
  error = "error",
}

/**
 * Describes the different paths through which a flow can be navigated by a user
 */
export enum ApplicationPath {
  Save,
  Resume,
  SingleSession,
  SaveAndReturn,
}

/**
 * Body of request posted to /send-email endpoint
 * XXX: Matches the body created by a Hasura scheduled event - see tables.yml
 */
export interface SendEmailPayload {
  payload: {
    email: string | undefined;
    sessionId: string;
  };
}
export type Session = {
  passport: Store.passport;
  breadcrumbs: Store.breadcrumbs;
  sessionId: string;
  // TODO: replace `id` with `flow: { id, published_flow_id }`
  id: SharedStore["id"];
  govUkPayment?: GovUKPayment;
};
