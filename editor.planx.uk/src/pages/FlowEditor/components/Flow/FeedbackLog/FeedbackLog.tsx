import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { format } from "date-fns";
import capitalize from "lodash/capitalize";
import React from "react";
import { Feedback } from "routes/feedback";
import FixedHeightDashboardContainer from "ui/editor/FixedHeightDashboardContainer";
import SettingsSection from "ui/editor/SettingsSection";
import { DataTable } from "ui/shared/DataTable/DataTable";
import { ColumnConfig, ColumnFilterType } from "ui/shared/DataTable/types";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import { ExpandableHelpText } from "./components/ExpandableHelpText";
import { FeedbackLogProps } from "./types";
import {
  EmojiRating,
  feedbackTypeIcon,
  generateCommentSummary,
  stripHTMLTags,
} from "./utils";

export const FeedbackLog: React.FC<FeedbackLogProps> = ({ feedback }) => {
  const columns: ColumnConfig<Feedback>[] = [
    { field: "flowName", headerName: "Service", width: 200 },
    {
      field: "type",
      headerName: "Type",
      width: 200,
      type: ColumnFilterType.CUSTOM,
      columnOptions: {
        filterable: false, // TODO: make filterable
        sortable: false,
        valueFormatter: (value) => {
          const { title } = feedbackTypeIcon(value);
          return title;
        },
      },
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
      type: ColumnFilterType.DATE,
      columnOptions: {
        valueFormatter: (params) =>
          format(new Date(params), "dd/MM/yy hh:mm:ss"),
      },
    },
    {
      field: "feedbackScore",
      headerName: "Rating",
      columnOptions: {
        filterable: false, // TODO: make filterable
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
    {
      field: "address",
      headerName: "Property address",
      width: 200,
    },
    {
      field: "projectType",
      headerName: "Project type",
    },
    {
      field: "nodeType",
      headerName: "Where",
      width: 280,
      type: ColumnFilterType.CUSTOM,
      customComponent: (params) => (
        <>{`${params.value} - ${params.row.nodeTitle}`}</>
      ),
      columnOptions: {
        filterable: false, // TODO: make filterable
      },
    },
    {
      field: "userContext",
      headerName: "What were you doing?",
      width: 280,
    },
    {
      field: "helpText",
      headerName: "Help text (more information)",
      width: 280,
      type: ColumnFilterType.CUSTOM,
      customComponent: ExpandableHelpText,
      columnOptions: {
        filterable: false, // TODO: make filterable
        valueFormatter: (params) => stripHTMLTags(params),
      },
    },
    {
      field: "browser",
      headerName: "Browser",
    },
    {
      field: "platform",
      headerName: "Device",
      columnOptions: {
        valueFormatter: (params) => capitalize(params),
      },
    },
  ];

  return (
    <FixedHeightDashboardContainer bgColor="background.paper">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Feedback log
        </Typography>
        <Typography variant="body1" maxWidth="contentWrap">
          Feedback from users about this team's services.
        </Typography>
      </SettingsSection>
      {feedback.length === 0 ? (
        <ErrorSummary
          format="info"
          heading="No feedback found for this team"
          message="If you're looking for feedback from more than six months ago, please contact a PlanX developer"
        />
      ) : (
        <DataTable
          rows={feedback}
          columns={columns}
          csvExportFileName={`${format(Date.now(), "yyyy-MM-dd")}-feedback`}
        />
      )}
    </FixedHeightDashboardContainer>
  );
};
