import { BaseNodeData } from "../shared";

export interface FeedbackComponentProps extends BaseNodeData {
  title: string;
  description?: string;
  fn?: string;
}
export interface FormProps {
  feedbackScore: string;
  feedback: string;
}
