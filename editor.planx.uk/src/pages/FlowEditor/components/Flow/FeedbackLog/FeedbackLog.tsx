import Container from "@mui/material/Container";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Typography from "@mui/material/Typography";
import React from "react";
import SettingsSection from "ui/editor/SettingsSection";
import ErrorSummary from "ui/shared/ErrorSummary/ErrorSummary";

import { CollapsibleRow } from "./components/CollapsibleRow";
import { Feed } from "./styled";
import { FeedbackLogProps } from "./types";

export const FeedbackLog: React.FC<FeedbackLogProps> = ({ feedback }) => {
  const displayFeedbackItems = [
    "userComment",
    "address",
    "projectType",
    "where",
    "browserPlatform",
  ];

  return (
    <Container maxWidth="contentWrap">
      <SettingsSection>
        <Typography variant="h2" component="h3" gutterBottom>
          Feedback log
        </Typography>
        <Typography variant="body1">
          Feedback from users about this team's services.
        </Typography>
      </SettingsSection>
      <SettingsSection>
        {feedback.length === 0 ? (
          <ErrorSummary
            format="info"
            heading="No feedback found for this team"
            message="If you're looking for feedback from more than six months ago, please contact a PlanX developer"
          />
        ) : (
          <Feed>
            <Table stickyHeader sx={{ tableLayout: "fixed" }}>
              <TableHead>
                <TableRow
                  sx={{ "& > *": { borderBottomColor: "black !important" } }}
                >
                  <TableCell sx={{ width: 160 }}>
                    <strong>Type</strong>
                  </TableCell>
                  <TableCell sx={{ width: 100 }}>
                    <strong>Date</strong>
                  </TableCell>
                  <TableCell sx={{ width: 100 }}>
                    <strong>Service</strong>
                  </TableCell>
                  <TableCell sx={{ width: 140 }}>
                    <strong>Rating</strong>
                  </TableCell>
                  <TableCell sx={{ width: 340 }}>
                    <strong>Comment</strong>
                  </TableCell>
                  <TableCell sx={{ width: 60 }} />
                </TableRow>
              </TableHead>
              <TableBody>
                {feedback.map((item) => (
                  <CollapsibleRow
                    key={item.id}
                    {...item}
                    displayFeedbackItems={displayFeedbackItems}
                  />
                ))}
              </TableBody>
            </Table>
          </Feed>
        )}
      </SettingsSection>
    </Container>
  );
};
