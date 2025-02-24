import CloudDownload from "@mui/icons-material/CloudDownload";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import Payment from "@mui/icons-material/Payment";
import Send from "@mui/icons-material/Send";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import TableCell from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import ErrorFallback from "components/Error/ErrorFallback";
import { addDays, format, isBefore } from "date-fns";
import { DAYS_UNTIL_EXPIRY } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
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

  // console.log({ submissions });

  const rowData = submissions.map((submission) => ({
    ...submission,
    id: submission.eventId,
  }));

  //   [
  //     {
  //         "__typename": "submission_services_log",
  //         "sessionId": "6981b241-3883-4d60-a973-5e693c021810",
  //         "eventId": "f34636cb-651e-4de1-a0e2-d09586cabf02",
  //         "eventType": "Send to email",
  //         "status": "Success",
  //         "retry": false,
  //         "response": {
  //         },
  //         "createdAt": "2025-02-20T16:46:14.529048+00:00",
  //         "flowName": "jo"
  //     }
  // ]

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
      type: ColumnType.BOOLEAN,
      customComponent: (params) => <FormattedResponse {...params.row} />,
    },
  ];

  return <DataTable columns={columns} rows={rowData} />;
};

const CollapsibleRow: React.FC<Submission> = (submission) => {
  const [open, setOpen] = useState<boolean>(false);

  const [teamSlug, canUserEditTeam, submissionEmail] = useStore((state) => [
    state.teamSlug,
    state.canUserEditTeam,
    state.teamSettings?.submissionEmail,
  ]);

  // Only show an application download button if certain conditions are met
  const submissionDataExpirationDate = addDays(
    new Date(submission.createdAt),
    DAYS_UNTIL_EXPIRY,
  );
  const showDownloadButton =
    canUserEditTeam(teamSlug) &&
    submission.status === "Success" &&
    submission.eventType !== "Pay" &&
    submissionEmail &&
    isBefore(new Date(), submissionDataExpirationDate);

  return (
    <React.Fragment key={`${submission.eventId}-${submission.createdAt}`}>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          {showDownloadButton && (
            <Tooltip title="Download application data">
              <IconButton
                aria-label="download application"
                size="small"
                onClick={() => {
                  const zipUrl = `${
                    import.meta.env.VITE_APP_API_URL
                  }/download-application-files/${
                    submission.sessionId
                  }?localAuthority=${teamSlug}&email=${submissionEmail}`;
                  window.open(zipUrl, "_blank");
                }}
              >
                <CloudDownload />
              </IconButton>
            </Tooltip>
          )}
        </TableCell>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
      </TableRow>
      <TableRow sx={{ background: (theme) => theme.palette.background.paper }}>
        <TableCell sx={{ padding: 0, border: "none" }} colSpan={6}>
          <Collapse
            in={open}
            timeout="auto"
            unmountOnExit
            sx={{
              borderBottom: (theme) =>
                `1px solid ${theme.palette.border.light}`,
              padding: (theme) => theme.spacing(0, 1.5),
            }}
          >
            <FormattedResponse {...submission} />
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
};

export default EventsLog;
