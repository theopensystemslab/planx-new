import Typography from "@mui/material/Typography";
import React from "react";
import { Feedback } from "routes/feedback";
import FixedHeightDashboardContainer from "ui/editor/FixedHeightDashboardContainer";
import SettingsSection from "ui/editor/SettingsSection";
import { DataTable } from "ui/shared/DataTable/DataTable";
import { ColumnConfig } from "ui/shared/DataTable/types";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import { FeedbackLogProps } from "./types";

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
    { field: "type", headerName: "Type" },
    { field: "createdAt", headerName: "Date" },
    { field: "flowName", headerName: "Service", width: 200 },
    { field: "feedbackScore", headerName: "Rating" },
    { field: "userComment", headerName: "Comment", width: 340 },
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
