import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import React from "react";

import { ApplicationData } from "./model";

const StyledTableContainer = styled(TableContainer)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
}));

const StyledTable = styled(Table)({
  borderCollapse: "collapse",
});

const StyledTableCell = styled(TableCell)(({ theme }) => ({
  border: `1px solid ${theme.palette.divider}`,
}));

interface Props {
  applications: ApplicationData[];
}

function formatDate(date: Date | string) {
  if (date == "N/A") return date;
  const formattedDate = new Date(date).toLocaleDateString("en-UK");
  return formattedDate;
}

function formatBoolean(state: boolean) {
  return state ? "Yes" : "No";
}

function formatAmount(amount: number) {
  return "£" + (amount / 100).toFixed(2);
}

export default function ApplicationStatusTable(props: Props): JSX.Element {
  const applications = props.applications;

  return (
    <Box>
      <StyledTableContainer>
        <StyledTable stickyHeader aria-label="sticky table">
          <TableHead>
            <TableRow>
              {[
                "Session ID",
                "Submitted At",
                "User Invited To Pay",
                "Payment Status",
                "Amount",
                "Payment Date",
                "Sent To Email",
                "Sent To BOPS",
                "Sent To Uniform",
              ].map((headCell) => (
                <StyledTableCell key={headCell}>{headCell}</StyledTableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {applications.map((row: ApplicationData) => (
              <TableRow key={row.session_id}>
                <StyledTableCell component="th" scope="row">
                  {row.session_id}
                </StyledTableCell>
                <StyledTableCell>
                  {formatDate(row.submitted_at)}
                </StyledTableCell>
                <StyledTableCell>
                  {formatBoolean(row.user_invited_to_pay)}
                </StyledTableCell>
                <StyledTableCell>{row.payment_status}</StyledTableCell>
                <StyledTableCell>{formatAmount(row.amount)}</StyledTableCell>
                <StyledTableCell>
                  {formatDate(row.payment_date)}
                </StyledTableCell>
                <StyledTableCell>
                  {formatBoolean(row.sent_to_email)}
                </StyledTableCell>
                <StyledTableCell>
                  {formatBoolean(row.sent_to_bops)}
                </StyledTableCell>
                <StyledTableCell>
                  {formatBoolean(row.sent_to_uniform)}
                </StyledTableCell>
              </TableRow>
            ))}
          </TableBody>
        </StyledTable>
      </StyledTableContainer>
    </Box>
  );
}
