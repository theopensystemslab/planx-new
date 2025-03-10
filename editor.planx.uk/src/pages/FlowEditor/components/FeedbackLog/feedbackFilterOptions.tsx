import { FeedbackType } from "./types";
import { feedbackTypeText } from "./utils";

export type FeedbackTypeOption = {
  value: FeedbackType;
  label: string;
};

export const feedbackTypeOptions: FeedbackTypeOption[] = (
  [
    "issue",
    "idea",
    "comment",
    "helpful",
    "unhelpful",
    "component",
    "inaccuracy",
  ] as FeedbackType[]
).map((type) => ({
  value: type,
  label: feedbackTypeText(type),
}));
