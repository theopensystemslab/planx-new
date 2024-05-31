import {
  FlowStatus,
  GovUKPayment,
  NotifyPersonalisation,
  Team,
} from "@opensystemslab/planx-core/types";
import { OT } from "@planx/graph/types";
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
  status?: FlowStatus;
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
export type Passport = Store.passport;
export type Breadcrumbs = Store.breadcrumbs;

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
    description?: string;
  };
}

export interface AdminPanelData {
  id: string;
  name: string;
  slug: string;
  referenceCode?: string;
  homepage?: string;
  subdomain?: string;
  planningDataEnabled: boolean;
  article4sEnabled: string;
  govnotifyPersonalisation?: NotifyPersonalisation;
  govpayEnabled: boolean;
  sendToEmailAddress?: string;
  bopsSubmissionURL?: string;
  logo?: string;
  favicon?: string;
  primaryColour?: string;
  linkColour?: string;
  actionColour?: string;
}

export interface Operation {
  id: number;
  createdAt: string;
  actor?: {
    id: number;
    firstName: string;
    lastName: string;
  };
  data: Array<OT.Op>;
}
