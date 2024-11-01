import { BaseNodeData, parseBaseNodeData } from "../shared";
import {
  descriptionPlaceholder,
  disclaimerPlaceholder,
  freeformQuestionPlaceholder,
  ratingQuestionPlaceholder,
  titlePlaceholder,
} from "./components/placeholders";
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
  feedback: string;
}

export const parseFeedback = (
  data: Record<string, any> | undefined,
): Feedback => ({
  title: data?.title || titlePlaceholder,
  description: data?.description || descriptionPlaceholder,
  ratingQuestion: data?.ratingQuestion || ratingQuestionPlaceholder,
  freeformQuestion: data?.freeformQuestion || freeformQuestionPlaceholder,
  disclaimer: data?.disclaimer || disclaimerPlaceholder,
  feedbackRequired: data?.feedbackRequired || false,
  ...parseBaseNodeData(data),
});
