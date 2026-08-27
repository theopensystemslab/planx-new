import BarChartIcon from "@mui/icons-material/BarChart";
import type { GridRowParams } from "@mui/x-data-grid";
import { useNavigate } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import { AppErrorBoundary } from "components/Error/AppErrorBoundary";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useMemo } from "react";
import { EmptyState } from "ui/editor/EmptyState";
import { DataTable } from "ui/shared/DataTable/DataTable";
import type { ColumnConfig } from "ui/shared/DataTable/types";
import { ColumnFilterType } from "ui/shared/DataTable/types";
import { dateFormatter } from "ui/shared/DataTable/utils";

import { submissionStatusGroupedOptions } from "../submissionFilterOptions";
import type { EventsLogGroupedProps, SubmissionSummary } from "../types";
import { getConsolidatedStatus } from "../utils";
import { StatusChipGrouped } from "./StatusChipGrouped";

const EventsLogGrouped: React.FC<EventsLogGroupedProps> = ({
  submissions,
  loading,
  error,
  filterByFlow,
}) => {
  const navigate = useNavigate();
  const params = useParams({ strict: false });
  const teamSlug = useStore((state) => state.teamSlug);

  const handleRowClick = (rowParams: GridRowParams) => {
    const sessionId = rowParams.row.id;

    if (params.flow) {
      navigate({
        to: "/app/$team/$flow/submissions",
        params: { team: teamSlug, flow: params.flow },
        search: { detail: sessionId },
      });
    } else {
      navigate({
        to: "/app/$team/submissions",
        params: { team: teamSlug },
        search: { detail: sessionId },
      });
    }
  };

  // consolidate event types and statuses into single status
  const submissionsWithConsolidatedStatus = useMemo(() => {
    return submissions.map((submission) => ({
      ...submission,
      consolidatedStatus: getConsolidatedStatus(
        submission.status,
        submission.eventType,
      ),
    }));
  }, [submissions]);

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
      field: "consolidatedStatus",
      headerName: "Status",
      width: 125,
      type: ColumnFilterType.SINGLE_SELECT,
      customComponent: StatusChipGrouped,
      columnOptions: {
        valueOptions: submissionStatusGroupedOptions,
      },
    },
    {
      field: "eventCreatedAt",
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
    <AppErrorBoundary>
      <DataTable
        columns={columns}
        rows={submissionsWithConsolidatedStatus}
        onRowClick={handleRowClick}
      />
    </AppErrorBoundary>
  );
};

export default EventsLogGrouped;
