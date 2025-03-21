import { Feedback, FeedbackStatus } from "routes/feedback";

import { FeedbackType } from "./types";

export const EmojiRating = [
  { value: 1, label: "Terrible" },
  { value: 2, label: "Poor" },
  { value: 3, label: "Neutral" },
  { value: 4, label: "Good" },
  { value: 5, label: "Excellent" },
];

export const feedbackTypeText = (type: FeedbackType) => {
  switch (type) {
    case "issue":
      return "Issue";
    case "idea":
      return "Idea";
    case "comment":
      return "Comment";
    case "helpful":
      return "Helpful (help text)";
    case "unhelpful":
      return "Unhelpful (help text)";
    case "component":
      return "User satisfaction";
    default:
      return "Inaccuracy";
  }
};

export const feedbackStatusText: Record<FeedbackStatus, string> = {
  unread: "Unread",
  urgent: "Urgent",
  actioned: "Actioned",
  in_progress: "In progress",
};

export const getCombinedHelpText = (feedback: Feedback) => {
  const MAX_HELP_TEXT_LENGTH = 65;
  const combinedHelpText = [
    feedback.helpText,
    feedback.helpDefinition,
    feedback.helpSources,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();

  const truncatedHelpText =
    combinedHelpText.length > MAX_HELP_TEXT_LENGTH
      ? `${combinedHelpText.slice(0, MAX_HELP_TEXT_LENGTH)}...</p>`
      : combinedHelpText;

  return { truncated: truncatedHelpText, full: combinedHelpText };
};

export const stripHTMLTags = (str: string) => str?.replace(/<[^>]*>/g, "");
