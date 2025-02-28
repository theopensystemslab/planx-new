import { getGridStringOperators, GridFilterItem } from "@mui/x-data-grid";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import ErrorFallback from "components/Error/ErrorFallback";
import { format } from "date-fns";
import React from "react";
import { DataTable } from "ui/shared/DataTable/DataTable";
import { ColumnConfig, ColumnFilterType } from "ui/shared/DataTable/types";
import { containsItem } from "ui/shared/DataTable/utils";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import {
  submissionEventTypes,
  submissionStatusOptions,
} from "../submissionFilterOptions";
import { EventsLogProps, Submission } from "../types";
import { DownloadSubmissionButton } from "./DownloadSubmissionButton";
import { FormattedResponse } from "./FormattedResponse";
import { StatusChip } from "./StatusChip";
import { SubmissionEvent } from "./SubmissionEvent";

const EventsLog: React.FC<EventsLogProps> = ({
  submissions,
  loading,
  error,
  filterByFlow,
}) => {
  if (loading)
    return (
      <DelayedLoadingIndicator
        msDelayBeforeVisible={0}
        text="Fetching events..."
      />
    );
  if (error) return <ErrorFallback error={error} />;
  if (submissions.length === 0)
    return (
      <ErrorSummary
        format="info"
        heading={`No payments or submissions found for this ${
          filterByFlow ? "service" : "team"
        }`}
        message="If you're looking for events before 1st January 2024, please contact a PlanX developer."
      />
    );

  const rowData = submissions.map((submission) => ({
    ...submission,
    id: submission.eventId,
    downloadSubmissionLink: undefined,
  }));

  const defaultStringFilterOperator = getGridStringOperators().find(
    (op) => op.value === "contains",
  );

  const columns: ColumnConfig<Submission>[] = [
    { field: "flowName", headerName: "Service" },
    {
      field: "eventType",
      headerName: "Event",
      width: 250,
      type: ColumnFilterType.ARRAY,
      customComponent: SubmissionEvent,
      columnOptions: {
        valueOptions: submissionEventTypes,
      },
    },
    {
      field: "status",
      headerName: "Status",
      type: ColumnFilterType.ARRAY,
      customComponent: StatusChip,
      columnOptions: {
        valueOptions: submissionStatusOptions,
      },
    },
    {
      field: "createdAt",
      headerName: "Date",
      columnOptions: {
        valueFormatter: (params) =>
          format(new Date(params), "dd/MM/yy hh:mm:ss"),
      },
      type: ColumnFilterType.DATE,
    },
    { field: "sessionId", headerName: "Session ID", width: 350 },
    {
      field: "response",
      headerName: "Response",
      width: 350,
      type: ColumnFilterType.CUSTOM,
      customComponent: (params) => <FormattedResponse {...params.row} />,
      columnOptions: {
        sortable: false,
        filterOperators: [
          {
            value: "contains",
            getApplyFilterFn: (filterItem: GridFilterItem) => {
              // return a function that is applied to all the rows in turn
              return (currentRowValue: Record<any, any>): boolean => {
                if (!currentRowValue?.data?.body) {
                  return false;
                }

                return containsItem(
                  currentRowValue.data.body,
                  filterItem.value,
                );
              };
            },
            InputComponent: defaultStringFilterOperator?.InputComponent,
            InputComponentProps:
              defaultStringFilterOperator?.InputComponentProps,
          },
        ],
      },
    },
    {
      field: "downloadSubmissionLink" as keyof Submission,
      headerName: "",
      width: 100,
      type: ColumnFilterType.CUSTOM,
      customComponent: DownloadSubmissionButton,
      columnOptions: {
        filterable: false,
        sortable: false,
      },
    },
  ];

  return <DataTable columns={columns} rows={rowData} />;
};

export default EventsLog;
