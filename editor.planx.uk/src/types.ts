import { GovUKPayment } from "@opensystemslab/planx-core/types";
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
  notifyPersonalisation?: NotifyPersonalisation;
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
  boundary?: string;
}

export interface NotifyPersonalisation {
  helpEmail: string;
  helpPhone: string;
  emailReplyToId: string;
  helpOpeningHours: string;
}

export interface GlobalSettings {
  footerContent?: { [key: string]: TextContent };
}

export const FOOTER_ITEMS = ["privacy", "help"];

const FLOW_SETTINGS = [...FOOTER_ITEMS, "legalDisclaimer"] as const;
export interface FlowSettings {
  elements?: {
    [key in (typeof FLOW_SETTINGS)[number]]?: TextContent;
  };
}

export interface TextContent {
  heading: string;
  content: string;
  show: boolean;
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

export interface ReconciliationResponse {
  message: string;
  changesFound: boolean | null;
  alteredSectionIds?: string[];
  reconciledSessionData: Omit<Session, "passport">;
}

// re-export store types
export interface Passport extends Store.passport {}
export interface Breadcrumbs extends Store.breadcrumbs {}

export enum SectionStatus {
  NeedsUpdated = "NEW INFORMATION NEEDED",
  ReadyToContinue = "READY TO CONTINUE",
  Started = "CANNOT CONTINUE YET",
  ReadyToStart = "READY TO START",
  NotStarted = "CANNOT START YET",
  Completed = "COMPLETED",
}

export interface SectionNode extends Store.node {
  data: {
    title: string;
  };
}
