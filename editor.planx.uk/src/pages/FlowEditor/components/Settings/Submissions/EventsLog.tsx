import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import KeyboardArrowDown from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUp from "@mui/icons-material/KeyboardArrowUp";
import Payment from "@mui/icons-material/Payment";
import Send from "@mui/icons-material/Send";
import Avatar from "@mui/material/Avatar";
import Box from "@mui/material/Box";
import Collapse from "@mui/material/Collapse";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator";
import ErrorFallback from "components/ErrorFallback";
import { format } from "date-fns";
import React, { useState } from "react";

import { GetSubmissionsResponse, Submission } from ".";

const ErrorSummary = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(3),
  border: `5px solid ${theme.palette.error.main}`,
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
      <ErrorSummary role="status" data-testid="error-summary">
        <Typography variant="h4" gutterBottom>
          {`No payments or submissions found for this service`}
        </Typography>
        <Typography variant="body2">
          {`If you're looking for events before January 1, 2024, please contact a PlanX developer.`}
        </Typography>
      </ErrorSummary>
    );

  return (
    <TableContainer>
      <Table sx={{ tableLayout: "fixed" }}>
        <TableHead>
          <TableRow>
            <TableCell sx={{ width: 300 }}>
              <strong>Event</strong>
            </TableCell>
            <TableCell sx={{ width: 200 }}>
              <strong>Date</strong>
            </TableCell>
            <TableCell sx={{ width: 380 }}>
              <strong>Session ID</strong>
            </TableCell>
            <TableCell sx={{ width: 70 }}></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {submissions.map((submission) => (
            <CollapsibleRow {...submission} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const CollapsibleRow: React.FC<Submission> = (submission) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <React.Fragment key={submission.eventId}>
      <TableRow sx={{ "& > *": { borderBottom: "unset" } }}>
        <TableCell>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <Avatar
              sx={{
                background: "none",
                marginRight: (theme) => theme.spacing(1.5),
              }}
            >
              {submission.status === "Success" ? (
                <CheckCircleIcon color="success" />
              ) : (
                <CancelIcon color="error" />
              )}
            </Avatar>

            {submission.eventType === "Pay" ? <Payment /> : <Send />}
            <Typography variant="body2" ml={0.5}>
              {submission.eventType}
            </Typography>
          </Box>
        </TableCell>
        <TableCell>
          {format(new Date(submission.createdAt), "dd/MM/yy hh:mm:ss")}
        </TableCell>
        <TableCell>{submission.sessionId}</TableCell>
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
        <TableCell sx={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
          <Collapse in={open} timeout="auto" unmountOnExit>
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
      <Box sx={{ margin: 1 }}>
        <Typography variant="body2">
          {`GOV.UK Pay reference: ${submission.eventId}`}
        </Typography>
      </Box>
    );
  } else {
    return (
      <Box
        component="pre"
        sx={{
          fontSize: "1em",
          margin: 1,
          maxWidth: "contentWrap",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
        }}
      >
        {submission.status === "Success"
          ? JSON.stringify(JSON.parse(submission.response?.data?.body), null, 2)
          : JSON.stringify(
              JSON.parse(submission.response?.data?.message),
              null,
              2,
            )}
      </Box>
    );
  }
};

export default EventsLog;
