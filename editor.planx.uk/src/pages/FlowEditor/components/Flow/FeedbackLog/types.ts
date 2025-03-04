import { Feedback } from "routes/feedback";

export type FeedbackType =
  | "issue"
  | "idea"
  | "comment"
  | "inaccuracy"
  | "helpful"
  | "unhelpful"
  | "component";

export interface CollapsibleRowProps extends Feedback {
  displayFeedbackItems: string[];
}
export interface FeedbackLogProps {
  feedback: Feedback[];
}
