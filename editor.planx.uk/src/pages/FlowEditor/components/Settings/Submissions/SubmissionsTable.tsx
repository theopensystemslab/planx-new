import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";

import { SubmissionData } from "./submissionData";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
  overflow: "auto",
  "&:focus": {
    outline: `2px solid ${theme.palette.primary.main}`,
  },
}));

const StyledTable = styled(Table)({
  borderCollapse: "collapse",
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
}));

const DividerStyled = styled(Box)({
  paddingBottom: "8px",
  marginBottom: "8px",
  borderBottom: "1px solid #eee",
  "&:last-child": {
    border: "none",
    paddingBottom: "0",
    marginBottom: "0",
  },
});

function formatDate(date: Date | string) {
  if (date === "N/A") return date;
  return new Date(date).toLocaleDateString("en-UK");
}

interface SubmissionsTableProps {
  applications: SubmissionData[];
}

const SubmissionsTable: React.FC<SubmissionsTableProps> = ({
  applications,
}) => {
  return (
    <StyledTableContainer>
      <StyledTable stickyHeader aria-label="sticky table">
        <TableHead>
          <TableRow>
            {[
              "Session ID",
              "Submitted At",
              "Payment Requests",
              "Payment Status",
              "BOPS Applications",
              "Uniform Applications",
              "Email Applications",
            ].map((headCell) => (
              <StyledTableCell key={headCell}>{headCell}</StyledTableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {applications.map((row) => (
            <TableRow key={row.sessionId}>
              <StyledTableCell component="th" scope="row">
                {row.sessionId}
              </StyledTableCell>
              <StyledTableCell>{formatDate(row.submittedAt)}</StyledTableCell>
              <StyledTableCell>
                {row.paymentRequests && row.paymentRequests.length > 0
                  ? row.paymentRequests.map((request, index) => (
                      <DividerStyled key={index}>
                        ID: {request.id}, Created At:{" "}
                        {formatDate(request.createdAt)}, Paid At:{" "}
                        {formatDate(request.paidAt)}, Gov Payment ID:{" "}
                        {request.govPaymentId}
                      </DividerStyled>
                    ))
                  : "None"}
              </StyledTableCell>
              <StyledTableCell>
                {row.paymentStatus && row.paymentStatus.length > 0
                  ? row.paymentStatus.map((status, index) => (
                      <DividerStyled key={index}>
                        Gov Payment ID: {status.govPaymentId}, Created At:{" "}
                        {formatDate(status.createdAt)}, Status: {status.status}
                      </DividerStyled>
                    ))
                  : "None"}
              </StyledTableCell>
              <StyledTableCell>
                {row.bopsApplications && row.bopsApplications.length > 0
                  ? row.bopsApplications.map((app, index) => (
                      <DividerStyled key={index}>
                        ID: {app.id}, Submitted At:{" "}
                        {formatDate(app.submittedAt)}, Destination URL:{" "}
                        {app.destinationUrl}
                      </DividerStyled>
                    ))
                  : "None"}
              </StyledTableCell>
              <StyledTableCell>
                {row.uniformApplications && row.uniformApplications.length > 0
                  ? row.uniformApplications.map((app, index) => (
                      <DividerStyled key={index}>
                        ID: {app.id}, Submitted At:{" "}
                        {formatDate(app.submittedAt)}
                      </DividerStyled>
                    ))
                  : "None"}
              </StyledTableCell>
              <StyledTableCell>
                {row.emailApplications && row.emailApplications.length > 0
                  ? row.emailApplications.map((email, index) => (
                      <DividerStyled key={index}>
                        ID: {email.id}, Recipient: {email.recipient}, Submitted
                        At: {formatDate(email.submittedAt)}
                      </DividerStyled>
                    ))
                  : "None"}
              </StyledTableCell>
            </TableRow>
          ))}
        </TableBody>
      </StyledTable>
    </StyledTableContainer>
  );
};

export default SubmissionsTable;
