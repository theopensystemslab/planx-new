import { Feedback } from "routes/feedback";

import { FeedbackType } from "./types";

export const generateCommentSummary = (userComment: string | null) => {
  const COMMENT_LENGTH = 100;
  if (!userComment) return "No comment";

  const shouldBeSummarised = userComment.length > COMMENT_LENGTH;
  if (shouldBeSummarised) return `${userComment.slice(0, COMMENT_LENGTH)}...`;

  return userComment;
};

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
