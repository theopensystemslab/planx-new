import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { format } from "date-fns";
import React from "react";
import { Feedback } from "routes/feedback";
import FixedHeightDashboardContainer from "ui/editor/FixedHeightDashboardContainer";
import SettingsSection from "ui/editor/SettingsSection";
import { DataTable } from "ui/shared/DataTable/DataTable";
import { ColumnConfig, ColumnType } from "ui/shared/DataTable/types";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import { FeedbackLogProps } from "./types";
import { EmojiRating, feedbackTypeIcon, generateCommentSummary } from "./utils";

export const FeedbackLog: React.FC<FeedbackLogProps> = ({ feedback }) => {
  const displayFeedbackItems = [
    "userComment",
    "address",
    "projectType",
    "where",
    "browserPlatform",
  ];

  // {
  //   "__typename": "feedback_summary",
  //   "address": null,
  //   "createdAt": "2025-02-25T15:44:18.168052+00:00",
  //   "feedbackScore": null,
  //   "flowName": "Apply for planning permission",
  //   "id": 1,
  //   "nodeTitle": null,
  //   "nodeType": null,
  //   "type": "issue",
  //   "userComment": "Hated it",
  //   "userContext": "Reading"
  // }

  const columns: ColumnConfig<Feedback>[] = [
    {
      field: "type",
      headerName: "Type",
      width: 200,
      type: ColumnType.BOOLEAN,
      customComponent: (params) => {
        const { icon, title } = feedbackTypeIcon(params.value);

        return (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {icon}
            {title}
          </Box>
        );
      },
    },
    {
      field: "createdAt",
      headerName: "Date",
      columnOptions: {
        valueFormatter: (params) =>
          format(new Date(params), "dd/MM/yy hh:mm:ss"),
      },
    },
    { field: "flowName", headerName: "Service", width: 200 },
    {
      field: "feedbackScore",
      headerName: "Rating",
      columnOptions: {
        valueFormatter: (params) => EmojiRating[params],
      },
    },
    {
      field: "userComment",
      headerName: "Comment",
      width: 340,
      columnOptions: {
        valueFormatter: (params) => generateCommentSummary(params),
      },
    },
  ];

  return (
    <FixedHeightDashboardContainer>
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Feedback log
        </Typography>
        <Typography variant="body1">
          Feedback from users about this team's services.
        </Typography>
      </SettingsSection>
      <SettingsSection>
        {feedback.length === 0 ? (
          <ErrorSummary
            format="info"
            heading="No feedback found for this team"
            message="If you're looking for feedback from more than six months ago, please contact a PlanX developer"
          />
        ) : (
          <DataTable rows={feedback} columns={columns} />
        )}
      </SettingsSection>
    </FixedHeightDashboardContainer>
  );
};
