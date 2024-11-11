import { BaseNodeData, parseBaseNodeData } from "../shared";
import { defaultContent } from "./components/defaultContent";
export interface Feedback extends BaseNodeData {
  title?: string;
  description?: string;
  ratingQuestion?: string;
  freeformQuestion?: string;
  disclaimer?: string;
  feedbackRequired: boolean;
}
export interface FormProps {
  feedbackScore: string;
  userComment: string;
}

export const parseFeedback = (
  data: Record<string, any> | undefined,
): Feedback => ({
  title: data?.title || defaultContent.title,
  description: data?.description || defaultContent.description,
  ratingQuestion: data?.ratingQuestion || defaultContent.ratingQuestion,
  freeformQuestion: data?.freeformQuestion || defaultContent.freeformQuestion,
  disclaimer: data?.disclaimer || defaultContent.disclaimer,
  feedbackRequired: data?.feedbackRequired || defaultContent.feedbackRequired,
  ...parseBaseNodeData(data),
});
