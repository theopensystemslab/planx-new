import BarChartIcon from "@mui/icons-material/BarChart";
import type { GridFilterItem } from "@mui/x-data-grid";
import { useNavigate } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import ErrorFallback from "components/Error/ErrorFallback";
import React, { useState } from "react";
import { ErrorBoundary } from "react-error-boundary";
import { EmptyState } from "ui/editor/EmptyState";
import { DataTable } from "ui/shared/DataTable/DataTable";
import type { ColumnConfig } from "ui/shared/DataTable/types";
import { ColumnFilterType } from "ui/shared/DataTable/types";
import { dateFormatter } from "ui/shared/DataTable/utils";

import { submissionStatusOptions } from "../submissionFilterOptions";
import type {
  EventsLogGroupedProps,
  Submission,
  SubmissionSummary,
} from "../types";
import { StatusChip } from "./StatusChip";
import SubmissionDetailModal from "./SubmissionDetailModal";

const EventsLog: React.FC<EventsLogGroupedProps> = ({
  submissions,
  loading,
  error,
  filterByFlow,
}) => {
  const [selectedSubmission, setSelectedSubmission] =
    useState<Submission | null>(null);

  if (loading)
    return (
      <DelayedLoadingIndicator
        msDelayBeforeVisible={0}
        text="Fetching events..."
      />
    );

  if (error) throw error;

  if (submissions.length === 0)
    return (
      <EmptyState
        title={`No payment or send events found for this ${filterByFlow ? "service" : "team"}`}
        description="If you're looking for events before 1st January 2024, please contact a PlanX developer"
        icon={<BarChartIcon />}
      />
    );

  const columns: ColumnConfig<SubmissionSummary>[] = [
    {
      field: "flowName",
      headerName: "Service",
      width: 250,
      type: ColumnFilterType.SINGLE_SELECT,
      customComponent: (params) => <strong>{`${params.value}`}</strong>,
      columnOptions: {
        // Allow filtering by unique flow names
        valueOptions: [...new Set(submissions.map(({ flowName }) => flowName))],
      },
    },
    {
      field: "address",
      headerName: "Address",
      width: 250,
    },
    {
      field: "status",
      headerName: "Status",
      width: 125,
      type: ColumnFilterType.SINGLE_SELECT,
      customComponent: StatusChip,
      columnOptions: {
        valueOptions: submissionStatusOptions,
      },
    },
    {
      field: "mostRecentDate",
      headerName: "Date",
      width: 125,
      columnOptions: {
        valueFormatter: dateFormatter,
      },
      type: ColumnFilterType.DATE,
    },
    { field: "id", headerName: "Session ID", width: 400 },
  ];

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <DataTable
        columns={columns}
        rows={submissions}
        onRowClick={(params) => setSelectedSubmission(params.row)}
      />
      <SubmissionDetailModal
        open={!!selectedSubmission}
        sessionId={selectedSubmission?.sessionId}
        handleClose={() => setSelectedSubmission(null)}
      />
    </ErrorBoundary>
  );
};

export default EventsLog;
