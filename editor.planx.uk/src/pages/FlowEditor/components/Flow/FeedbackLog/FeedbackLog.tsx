import Typography from "@mui/material/Typography";
import { GridFilterItem } from "@mui/x-data-grid";
import { format } from "date-fns";
import capitalize from "lodash/capitalize";
import React from "react";
import { Feedback } from "routes/feedback";
import FixedHeightDashboardContainer from "ui/editor/FixedHeightDashboardContainer";
import SettingsSection from "ui/editor/SettingsSection";
import { MultipleOptionSelectFilter } from "ui/shared/DataTable/components/MultipleOptionSelectFilter";
import { DataTable } from "ui/shared/DataTable/DataTable";
import { ColumnConfig, ColumnFilterType } from "ui/shared/DataTable/types";
import {
  containsItem,
  dateFormatter,
  isValidFilterInput,
} from "ui/shared/DataTable/utils";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import { ExpandableHelpText } from "./components/ExpandableHelpText";
import { feedbackTypeOptions } from "./feedbackFilterOptions";
import { FeedbackLogProps } from "./types";
import { EmojiRating, feedbackTypeText, stripHTMLTags } from "./utils";

export const FeedbackLog: React.FC<FeedbackLogProps> = ({ feedback }) => {
  const columns: ColumnConfig<Feedback>[] = [
    {
      field: "flowName",
      headerName: "Service",
      width: 250,
      type: ColumnFilterType.CUSTOM,
      customComponent: (params) => <strong>{`${params.value}`}</strong>,
    },
    {
      field: "type",
      headerName: "Type",
      width: 200,
      type: ColumnFilterType.ARRAY,
      columnOptions: {
        valueOptions: feedbackTypeOptions.map((option) => option.label),
        filterOperators: [
          {
            value: "is",
            getApplyFilterFn: (filterItem: GridFilterItem) => {
              if (!isValidFilterInput(filterItem)) {
                return null;
              }
              // return a function that is applied to all the rows in turn
              return (currentRowValue: any): boolean => {
                return filterItem.value.some(
                  (filterValue: Pick<GridFilterItem, "value">) =>
                    containsItem(
                      feedbackTypeText(currentRowValue),
                      filterValue,
                    ),
                );
              };
            },
            InputComponent: MultipleOptionSelectFilter,
            InputComponentProps: {
              options: feedbackTypeOptions.map((option) => option.label),
            },
          },
        ],
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
      columnOptions: {
        filterable: false, // TODO: make filterable
        valueFormatter: (params) => EmojiRating[params],
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
          Feedback log
        </Typography>
        <Typography variant="body1" maxWidth="contentWrap">
          Feedback from users about this team's services.
        </Typography>
      </SettingsSection>
      {feedback.length === 0 ? (
        <SettingsSection>
          <ErrorSummary
            format="info"
            heading="No feedback found for this team"
            message="If you're looking for feedback from more than six months ago, please contact a PlanX developer"
          />
        </SettingsSection>
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
