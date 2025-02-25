import Payment from "@mui/icons-material/Payment";
import Send from "@mui/icons-material/Send";
import Chip from "@mui/material/Chip";
import Typography from "@mui/material/Typography";
import { getGridStringOperators, GridFilterItem } from "@mui/x-data-grid";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import ErrorFallback from "components/Error/ErrorFallback";
import { format } from "date-fns";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DataTable } from "ui/shared/DataTable/DataTable";
import { ColumnConfig, ColumnFilterType } from "ui/shared/DataTable/types";
import { containsItem } from "ui/shared/DataTable/utils";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import { EventsLogProps, Submission } from "../types";
import { DownloadSubmissionButton } from "./DownloadSubmissionButton";
import { FormattedResponse } from "./FormattedResponse";

const EventsLog: React.FC<EventsLogProps> = ({
  submissions,
  loading,
  error,
  filterByFlow,
}) => {
  const [teamSlug, canUserEditTeam, submissionEmail] = useStore((state) => [
    state.teamSlug,
    state.canUserEditTeam,
    state.teamSettings?.submissionEmail,
  ]);

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
    { field: "flowName", headerName: "Flow name" },
    {
      field: "eventType",
      headerName: "Event",
      width: 250,
      type: ColumnFilterType.ARRAY,
      customComponent: (params) => {
        return (
          <>
            {params.value === "Pay" ? <Payment /> : <Send />}
            <Typography variant="body2" ml={1}>
              {params.value} {params.row.retry && ` [Retry]`}
            </Typography>
          </>
        );
      },
      columnOptions: {
        valueOptions: [
          "Send to email",
          "Pay",
          "Submit to BOPS",
          "Submit to Uniform",
          "Upload to AWS S3",
        ],
      },
    },
    {
      field: "status",
      headerName: "Status",
      type: ColumnFilterType.ARRAY,
      customComponent: (params) => {
        return params.value === "Success" ? (
          <Chip label="Success" size="small" color="success" />
        ) : (
          <Chip label={params.value} size="small" color="error" />
        );
      },
      columnOptions: {
        valueOptions: [
          "Success",
          "Failed (500)",
          "Failed (502)",
          "Failed (503)",
          "Failed (504)",
          "Failed (400)",
          "Failed (401)",
          "Started",
          "Submitted",
          "Capturable",
          "Failed",
          "Cancelled",
          "Error",
          "Unknown",
        ],
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
