import Typography from "@mui/material/Typography";
import { format } from "date-fns";
import capitalize from "lodash/capitalize";
import React from "react";
import FixedHeightDashboardContainer from "ui/editor/FixedHeightDashboardContainer";
import SettingsSection from "ui/editor/SettingsSection";
import { DataTable } from "ui/shared/DataTable/DataTable";
import { ColumnConfig, ColumnFilterType } from "ui/shared/DataTable/types";
import { dateFormatter } from "ui/shared/DataTable/utils";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import { ChangeStatusTool } from "./components/ChangeStatusTool";
import { ExpandableHelpText } from "./components/ExpandableHelpText";
import { StatusChip } from "./components/StatusChip";
import { feedbackTypeOptions, statusOptions } from "./feedbackFilterOptions";
import { updateEditorNotes } from "./queries/updateEditorNotes";
import { Feedback, FeedbackLogProps } from "./types";
import { EmojiRating, feedbackTypeText, stripHTMLTags } from "./utils";

export const FeedbackLog: React.FC<FeedbackLogProps> = ({
  feedback,
  isFlowLevel,
}) => {
  const handleProcessRowUpdate = async (updatedRow: Feedback) => {
    await updateEditorNotes(updatedRow);
    return updatedRow;
  };

  const columns: ColumnConfig<Feedback>[] = [
    {
      field: "status",
      headerName: "Status",
      type: ColumnFilterType.ARRAY,
      customComponent: StatusChip,
      columnOptions: {
        valueOptions: statusOptions,
        filterable: false,
      },
    },
    {
      field: "flowName",
      headerName: "Service",
      width: 250,
      type: ColumnFilterType.SINGLE_SELECT,
      customComponent: (params) => <strong>{`${params.value}`}</strong>,
      columnOptions: {
        // Allow filtering by unique flow names
        valueOptions: [...new Set(feedback.map(({ flowName }) => flowName))],
      },
    },
    {
      field: "editorNotes",
      headerName: "Editor notes",
      width: 250,
      columnOptions: {
        editable: true,
        sortable: false,
      },
    },
    {
      field: "type",
      headerName: "Type",
      width: 200,
      type: ColumnFilterType.SINGLE_SELECT,
      columnOptions: {
        valueOptions: feedbackTypeOptions,
      },
      customComponent: (params) => <>{feedbackTypeText(params.value)}</>,
    },
    {
      field: "createdAt",
      headerName: "Date",
      width: 125,
      type: ColumnFilterType.DATE,
      columnOptions: {
        valueFormatter: dateFormatter,
      },
    },
    {
      field: "feedbackScore",
      headerName: "Rating",
      width: 125,
      type: ColumnFilterType.SINGLE_SELECT,
      columnOptions: {
        valueOptions: EmojiRating,
      },
    },
    {
      field: "userComment",
      headerName: "Comment",
      width: 340,
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
      customComponent: (params) => (
        <>{`${params.value} - ${params.row.nodeTitle}`}</>
      ),
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
      customComponent: (params) => <ExpandableHelpText {...params} />,
      columnOptions: {
        valueFormatter: (params) => stripHTMLTags(params),
      },
    },
    {
      field: "browser",
      headerName: "Browser",
      width: 125,
    },
    {
      field: "platform",
      headerName: "Device",
      width: 125,
      columnOptions: {
        valueFormatter: (params) => capitalize(params),
      },
    },
  ];

  return (
    <FixedHeightDashboardContainer bgColor="background.paper">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Feedback
        </Typography>
        <Typography variant="body1" maxWidth="contentWrap">
          Feedback reports from users about{" "}
          {isFlowLevel ? "this service" : "all services in this team"}. This
          table only includes feedback received within the last six months.
        </Typography>
      </SettingsSection>
      {feedback.length === 0 ? (
        <SettingsSection>
          <ErrorSummary
            format="info"
            heading={`No feedback found for this ${
              isFlowLevel ? "service" : "team"
            }`}
            message="If you're looking for feedback from more than six months ago, please contact a PlanX developer"
          />
        </SettingsSection>
      ) : (
        <DataTable
          rows={feedback}
          columns={columns}
          csvExportFileName={`${format(Date.now(), "yyyy-MM-dd")}-feedback`}
          onProcessRowUpdate={handleProcessRowUpdate}
          checkboxSelection
          customTools={[ChangeStatusTool]}
        />
      )}
    </FixedHeightDashboardContainer>
  );
};
