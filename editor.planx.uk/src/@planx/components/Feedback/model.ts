import { number, object, string } from "yup";

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
  feedbackScore: 1 | 2 | 3 | 4 | 5;
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

export const createFeedbackSchema = (feedbackRequired: boolean) => {
  return object().shape({
    userComment: feedbackRequired
      ? string().required("Enter your feedback")
      : string(),
    feedbackScore: feedbackRequired
      ? number()
          .integer()
          .min(1, "Feedback score must be at least 1")
          .max(5, "Feedback score cannot exceed 5")
          .required("Please provide a feedback score")
      : number()
          .integer()
          .min(1, "Feedback score must be at least 1")
          .max(5, "Feedback score cannot exceed 5"),
  });
};
