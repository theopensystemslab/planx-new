import CloudDownload from "@mui/icons-material/CloudDownload";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import Payment from "@mui/icons-material/Payment";
import Send from "@mui/icons-material/Send";
import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import ErrorFallback from "components/Error/ErrorFallback";
import { addDays, format, isBefore } from "date-fns";
import { DAYS_UNTIL_EXPIRY } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useState } from "react";
import ErrorSummary from "ui/shared/ErrorSummary";

import { GetSubmissionsResponse, Submission } from ".";

const Response = styled(Box)(() => ({
  fontSize: "1em",
  margin: 1,
  maxWidth: "contentWrap",
  overflowWrap: "break-word",
  whiteSpace: "pre-wrap",
}));

// Style the table container like an event feed with bottom-anchored scroll
const Feed = styled(TableContainer)(() => ({
  maxHeight: "60vh",
  overflow: "auto",
  display: "flex",
  flexDirection: "column-reverse",
  readingOrder: "flex-visual",
}));

const EventsLog: React.FC<GetSubmissionsResponse> = ({
  submissions,
  loading,
  error,
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
        heading="No payments or submissions found for this service"
        message="If you're looking for events before 1st January 2024, please contact a PlanX developer."
      />
    );
  return (
    <Feed>
      <Table stickyHeader sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow sx={{ "& > *": { borderBottomColor: "black !important" } }}>
            <TableCell sx={{ width: 250 }}>
              <strong>Event</strong>
            </TableCell>
            <TableCell sx={{ width: 130 }}>
              <strong>Status</strong>
            </TableCell>
            <TableCell sx={{ width: 120 }}>
              <strong>Date</strong>
            </TableCell>
            <TableCell sx={{ width: 350 }}>
              <strong>Session ID</strong>
            </TableCell>
            <TableCell sx={{ width: 50 }}></TableCell>
            <TableCell sx={{ width: 50 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((submission, i) => (
            <CollapsibleRow {...submission} key={i} />
          ))}
        </TableBody>
      </Table>
    </Feed>
  );
};

const CollapsibleRow: React.FC<Submission> = (submission) => {
  const [open, setOpen] = useState<boolean>(false);

  const [teamSlug, canUserEditTeam, submissionEmail] = useStore((state) => [
    state.teamSlug,
    state.canUserEditTeam,
    state.teamSettings?.submissionEmail,
  ]);

  // Only show an application download button if certain conditions are met
  const submissionDataExpirationDate = addDays(new Date(), DAYS_UNTIL_EXPIRY);
  const showDownloadButton =
    canUserEditTeam(teamSlug) &&
    submission.status === "Success" &&
    submissionEmail &&
    isBefore(new Date(submission.createdAt), submissionDataExpirationDate);

  return (
    <React.Fragment key={`${submission.eventId}-${submission.createdAt}`}>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            {submission.eventType === "Pay" ? <Payment /> : <Send />}
            <Typography variant="body2" ml={1}>
              {submission.eventType} {submission.retry && ` [Retry]`}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          {submission.status === "Success" ? (
            <Chip label="Success" size="small" color="success" />
          ) : (
            <Chip label={submission.status} size="small" color="error" />
          )}
        </TableCell>
        <TableCell>
          {format(new Date(submission.createdAt), "dd/MM/yy hh:mm:ss")}
        </TableCell>
        <TableCell>{submission.sessionId}</TableCell>
        <TableCell>
          {showDownloadButton && (
            <Tooltip arrow title="Download application data">
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

const FormattedResponse: React.FC<Submission> = (submission) => {
  if (submission.eventType === "Pay") {
    return (
      <Response component="pre">
        {JSON.stringify(submission.response, null, 2)}
      </Response>
    );
  } else {
    return (
      <Response component="pre">
        {submission.status === "Success"
          ? JSON.stringify(JSON.parse(submission.response?.data?.body), null, 2)
          : JSON.stringify(
              JSON.parse(submission.response?.data?.message),
              null,
              2,
            )}
      </Response>
    );
  }
};

export default EventsLog;
