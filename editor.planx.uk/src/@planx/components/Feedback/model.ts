import { richText } from "lib/yupExtensions";
import { boolean, number, object, SchemaOf, string } from "yup";

import {
  BaseNodeData,
  baseNodeDataValidationSchema,
  parseBaseNodeData,
} from "../shared";
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

export const validationSchema: SchemaOf<Feedback> =
  baseNodeDataValidationSchema.concat(
    object({
      title: string(),
      description: richText(),
      ratingQuestion: string(),
      freeformQuestion: string(),
      disclaimer: richText(),
      feedbackRequired: boolean().required(),
    }),
  );

export const createFeedbackSchema = (feedbackRequired: boolean) => {
  return object().shape({
    userComment: feedbackRequired
      ? string().required("Enter your feedback")
      : string(),
    feedbackScore: feedbackRequired
      ? number().integer().required("Please rate your experience")
      : number().integer(),
  });
};
