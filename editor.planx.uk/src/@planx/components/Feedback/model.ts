import { BaseNodeData, parseBaseNodeData } from "../shared";
export interface Feedback extends BaseNodeData {
  title?: string;
  description?: string;
  ratingQuestion?: string;
  freeformQuestion?: string;
  disclaimer?: string;

  feedbackRequired: boolean;
}
export const parseFeedback = (
  data: Record<string, any> | undefined,
): Feedback => ({
  title: data?.title || "", // TODO: add fallback strings
  description: data?.description || "", // TODO: add fallback strings
  ratingQuestion: data?.ratingQuestion || "", // TODO: add fallback strings
  freeformQuestion: data?.freeformQuestion || "", // TODO: add fallback strings
  disclaimer: data?.disclaimer || "", // TODO: add fallback strings

  feedbackRequired: data?.feedbackRequired || false,

  ...parseBaseNodeData(data),
});
