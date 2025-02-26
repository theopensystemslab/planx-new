import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import RateReviewIcon from "@mui/icons-material/RateReview";
import RuleIcon from "@mui/icons-material/Rule";
import WarningIcon from "@mui/icons-material/Warning";
import { client } from "lib/graphql";
import React from "react";

import { GET_FEEDBACK_BY_ID_QUERY } from "./queries/getFeedbackById";
import { FeedbackType, FeedbackTypeIcon } from "./types";

export const generateCommentSummary = (userComment: string | null) => {
  if (!userComment) return "No comment";

  const COMMENT_LENGTH = 50;
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

export const feedbackTypeIcon = (type: FeedbackType): FeedbackTypeIcon => {
  switch (type) {
    case "issue":
      return { icon: <WarningIcon />, title: "Issue" };
    case "idea":
      return { icon: <LightbulbIcon />, title: "Idea" };
    case "comment":
      return { icon: <MoreHorizIcon />, title: "Comment" };
    case "helpful":
      return {
        icon: <CheckCircleIcon color="success" />,
        title: "Helpful (help text)",
      };
    case "unhelpful":
      return {
        icon: <CancelIcon color="error" />,
        title: "Unhelpful (help text)",
      };
    case "component":
      return { icon: <RateReviewIcon />, title: "User satisfaction" };
    default:
      return { icon: <RuleIcon />, title: "Inaccuracy" };
  }
};

export const getDetailedFeedback = async (feedbackId: number) => {
  const {
    data: {
      feedback: [detailedFeedback],
    },
  } = await client.query({
    query: GET_FEEDBACK_BY_ID_QUERY,
    variables: { feedbackId },
  });

  const combinedHelpText = [
    detailedFeedback.helpText,
    detailedFeedback.helpDefinition,
    detailedFeedback.helpSources,
  ]
    .filter(Boolean)
    .join(" ")
    .trim();
  const truncatedHelpText =
    combinedHelpText.length > 65
      ? `${combinedHelpText.slice(0, 65)}...`
      : combinedHelpText;

  return {
    combinedHelp: truncatedHelpText,
    ...detailedFeedback,
    where: `${detailedFeedback.nodeType} — ${detailedFeedback.nodeTitle}`,
    browserPlatform: `${detailedFeedback.browser} / ${detailedFeedback.platform}`,
  };
};
