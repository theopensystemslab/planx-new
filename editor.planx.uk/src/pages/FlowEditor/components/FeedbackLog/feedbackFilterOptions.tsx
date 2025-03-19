import { FeedbackStatus } from "routes/feedback";

import { FeedbackType } from "./types";
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

export const statusOptions: StatusOption[] = (
  ["unread", "read", "to_follow_up", "urgent"] as const
).map((type) => ({
  value: type,
  label: feedbackStatusText[type],
}));
