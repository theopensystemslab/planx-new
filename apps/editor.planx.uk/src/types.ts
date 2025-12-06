import {
  FlowStatus,
  GovUKPayment,
  Team,
  TeamContactSettings,
} from "@opensystemslab/planx-core/types";
import { SectionLength } from "@planx/components/Section/model";
import { OT } from "@planx/graph/types";
import { FormikValues, useFormik } from "formik";
import { Progress } from "pages/FlowEditor/lib/store/navigation";

import { Store } from "./pages/FlowEditor/lib/store/index";
import { SharedStore } from "./pages/FlowEditor/lib/store/shared";

export type Maybe<T> = T | undefined;

export type FormikHookReturn<T extends FormikValues = FormikValues> =
  ReturnType<typeof useFormik<T>>;

export interface Flow {
  id: string;
  slug: string;
  name: string;
  team: Team;
  settings?: FlowSettings;
  status?: FlowStatus;
  summary?: string;
  isTemplate?: boolean;
  canCreateFromCopy?: boolean;
}
export interface GlobalSettings {
  footerContent?: { [key: string]: TextContent };
}

export const FOOTER_ITEMS = ["privacy", "help"];

const FLOW_SETTINGS = [
  ...FOOTER_ITEMS,
  "legalDisclaimer",
  "guidanceDisclaimer",
] as const;
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

/**
 * Describes the different paths through which a flow can be navigated by a user
 */
export enum ApplicationPath {
  Save,
  Resume,
  SingleSession,
  SaveAndReturn,
}

export type Session = {
  passport: Store.Passport;
  breadcrumbs: Store.Breadcrumbs;
  sessionId: string;
  // TODO: replace `id` with `flow: { id, published_flow_id }`
  id: SharedStore["id"];
  govUkPayment?: GovUKPayment;
  /** Only present on sessions for flow which utilise "Section" components */
  progress?: Progress;
};

// re-export store types
export type Passport = Store.Passport;
export type Breadcrumbs = Store.Breadcrumbs;

export enum SectionStatus {
  NeedsUpdated = "NEW INFORMATION NEEDED",
  ReadyToContinue = "READY TO CONTINUE",
  Started = "CANNOT CONTINUE YET",
  ReadyToStart = "READY TO START",
  NotStarted = "CANNOT START YET",
  Completed = "COMPLETED",
}

export interface SectionNode extends Store.Node {
  data: {
    title: string;
    description?: string;
    length: SectionLength;
  };
}

export interface LiveFlow {
  name: string;
  firstOnlineAt: string;
}

export interface AdminPanelData {
  id: string;
  name: string;
  slug: string;
  referenceCode?: string;
  homepage?: string;
  subdomain?: string;
  planningDataEnabled: boolean;
  article4sEnabled: boolean;
  govnotifyPersonalisation?: TeamContactSettings;
  govpayEnabled: boolean;
  powerAutomateEnabled: boolean;
  sendToEmailAddress?: string;
  bopsSubmissionURL?: string;
  logo?: string;
  favicon?: string;
  primaryColour?: string;
  linkColour?: string;
  actionColour?: string;
  liveFlows: LiveFlow[] | null;
  isTrial: boolean;
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
