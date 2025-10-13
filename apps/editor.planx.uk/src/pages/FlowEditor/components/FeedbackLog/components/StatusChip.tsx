import Chip from "@mui/material/Chip";
import { GridRenderCellParams, GridTreeNodeWithRender } from "@mui/x-data-grid";
import React from "react";

import { Feedback } from "../types";
import { feedbackStatusText } from "../utils";

export const FEEDBACK_COLOURS = {
  unread: "info",
  urgent: "error",
  in_progress: "warning",
  actioned: "success",
} as const;

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
