import { FEEDBACK_STATUS, FeedbackStatus, FeedbackType } from "./types";
import { feedbackStatusText, feedbackTypeText } from "./utils";

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

export type StatusOption = {
  value: FeedbackStatus;
  label: string;
};

export const statusOptions: StatusOption[] = FEEDBACK_STATUS.map((type) => ({
  value: type,
  label: feedbackStatusText[type],
}));
