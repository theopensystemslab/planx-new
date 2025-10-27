import {
  ComponentType as TYPES,
  FlowStatus,
} from "@opensystemslab/planx-core/types";
import { Operation } from "types";

export type HistoryItem =
  | OperationHistoryItem
  | CommentHistoryItem
  | PublishHistoryItem;

interface BaseHistoryItem {
  id: number;
  createdAt: string;
  actorId: number | undefined;
  firstName: string;
  lastName: string;
}

export interface OperationHistoryItem extends BaseHistoryItem {
  type: "operation";
  data: Operation["data"];
  comment: null;
}

export interface CommentHistoryItem extends BaseHistoryItem {
  type: "comment";
  data: null;
  comment: string;
}

export interface PublishHistoryItem extends BaseHistoryItem {
  type: "publish";
  data: null;
  comment: string | null; // @todo require input in future publish modal changes
}

export interface CheckForChangesResponse {
  alteredNodes: AlteredNode[];
  history: HistoryItem[];
  message: string;
  templatedFlows: TemplatedFlows;
  validationChecks: ValidationCheck[];
}

export interface PublishFlowResponse {
  alteredNodes: AlteredNode[];
  message: string;
}

export interface AlteredNode {
  id: string;
  type: TYPES;
  data?: any;
}

export type TemplatedFlows = {
  id: string;
  slug: string;
  team: {
    slug: string;
  };
  status: FlowStatus;
}[];

export interface PublishFlowArgs {
  summary: string;
  templatedFlowIds?: string[];
}

export interface ValidationCheck {
  title: string;
  status: "Pass" | "Fail" | "Warn" | "Not applicable";
  message: string;
}
