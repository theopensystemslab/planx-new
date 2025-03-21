import { ComponentType, Node } from "@opensystemslab/planx-core/types";
import { Sentiment } from "components/Feedback/MoreInfoFeedback/MoreInfoFeedback";
import { FeedbackCategory } from "components/Feedback/types";

export type FeedbackType = Sentiment | FeedbackCategory;

/** Matches feedback_status_enum table */
export const FEEDBACK_STATUS = [
  "unread",
  "read",
  "to_follow_up",
  "urgent",
] as const;
export type FeedbackStatus = (typeof FEEDBACK_STATUS)[number];

export interface Feedback {
  id: number;
  type: FeedbackType;
  nodeTitle: string | null;
  nodeType: keyof typeof ComponentType | null;
  userComment: string | null;
  userContext: string | null;
  createdAt: string;
  address: string | null;
  feedbackScore: number | null;
  flowName: string;
  platform: string;
  browser: string;
  helpDefinition: string | null;
  helpSources: string | null;
  helpText: string | null;
  nodeData: Node["data"] | null;
  nodeId: string | null;
  nodeText: string | null;
  projectType: string | null;
  status: FeedbackStatus;
  editorNotes: string | null;
}

export interface CollapsibleRowProps extends Feedback {
  displayFeedbackItems: string[];
}
export interface FeedbackLogProps {
  feedback: Feedback[];
}
