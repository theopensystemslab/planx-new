import Chip, { ChipProps } from "@mui/material/Chip";
import { GridRenderCellParams, GridTreeNodeWithRender } from "@mui/x-data-grid";
import React from "react";
import { Feedback, FeedbackStatus } from "routes/feedback";

import { feedbackStatusText } from "../utils";

const FEEDBACK_COLOURS: Record<FeedbackStatus, ChipProps["color"]> = {
  unread: "info",
  urgent: "error",
  in_progress: "warning",
  actioned: "success",
};

export const StatusChip = (
  params: GridRenderCellParams<
    Feedback,
    Feedback["status"],
    "singleSelect",
    GridTreeNodeWithRender
  >,
) => {
  if (!params.value) return;

  const color = FEEDBACK_COLOURS[params.value];
  const label = feedbackStatusText[params.value];

  return <Chip label={label} size="small" color={color} />;
};
