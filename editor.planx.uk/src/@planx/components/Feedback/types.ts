import { BaseNodeData } from "../shared";

export interface FeedbackComponentProps extends BaseNodeData {
  title: string;
  privacyPolicyLink?: string;
  fn?: string;
}
export interface FormProps {
  feedbackScore: string;
  feedback: string;
}
