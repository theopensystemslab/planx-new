import CloudDownload from "@mui/icons-material/CloudDownload";
import Payment from "@mui/icons-material/Payment";
import Send from "@mui/icons-material/Send";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import ErrorFallback from "components/Error/ErrorFallback";
import { addDays, format, isBefore } from "date-fns";
import { DAYS_UNTIL_EXPIRY } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { DataTable } from "ui/shared/DataTable/DataTable";
import { ColumnConfig, ColumnType } from "ui/shared/DataTable/types";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import { EventsLogProps, Submission } from "../types";
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

  const columns: ColumnConfig<Submission>[] = [
    { field: "flowName", headerName: "Flow name" },
    {
      field: "eventType",
      headerName: "Event",
      width: 250,
      type: ColumnType.BOOLEAN,
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
    },
    {
      field: "status",
      headerName: "Status",
      type: ColumnType.BOOLEAN, // might need string? and read value
      customComponent: (params) => {
        return params.value === "Success" ? (
          <Chip label="Success" size="small" color="success" />
        ) : (
          <Chip label={params.value} size="small" color="error" />
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
    { field: "sessionId", headerName: "Session ID", width: 350 },
    {
      field: "response",
      headerName: "Response",
      width: 350,
      type: ColumnType.BOOLEAN, // TODO: sort this!
      customComponent: (params) => <FormattedResponse {...params.row} />,
    },
    {
      field: "downloadSubmissionLink" as keyof Submission,
      headerName: "",
      width: 100,
      type: ColumnType.BOOLEAN, // TODO: sort this!

      customComponent: (params) => {
        const submissionDataExpirationDate = addDays(
          new Date(params.row.createdAt),
          DAYS_UNTIL_EXPIRY,
        );

        const showDownloadButton =
          teamSlug &&
          canUserEditTeam(teamSlug) &&
          submissionEmail &&
          params.row.status === "Success" &&
          params.row.eventType !== "Pay" &&
          isBefore(new Date(), submissionDataExpirationDate);

        const zipUrl =
          showDownloadButton &&
          `${import.meta.env.VITE_APP_API_URL}/download-application-files/${
            params.row.sessionId
          }?localAuthority=${teamSlug}&email=${submissionEmail}`;
        return zipUrl ? (
          <Tooltip title="Download application data">
            <IconButton
              aria-label="download application"
              size="small"
              onClick={() => window.open(zipUrl, "_blank")}
            >
              <CloudDownload />
            </IconButton>
          </Tooltip>
        ) : (
          <></>
        );
      },
    },
  ];

  return <DataTable columns={columns} rows={rowData} />;
};

export default EventsLog;
