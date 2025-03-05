import { Feedback } from "routes/feedback";

import { FeedbackType } from "./types";

export const EmojiRating: Record<number, string> = {
  1: "Terrible",
  2: "Poor",
  3: "Neutral",
  4: "Good",
  5: "Excellent",
};

export const feedbackTypeText = (type: FeedbackType) => {
  switch (type) {
    case "issue":
      return { title: "Issue" };
    case "idea":
      return { title: "Idea" };
    case "comment":
      return { title: "Comment" };
    case "helpful":
      return { title: "Helpful (help text)" };
    case "unhelpful":
      return { title: "Unhelpful (help text)" };
    case "component":
      return { title: "User satisfaction" };
    default:
      return { title: "Inaccuracy" };
  }
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
