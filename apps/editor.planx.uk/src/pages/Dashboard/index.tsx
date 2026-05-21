import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { DashboardWidget } from "ui/editor/DashboardWidget";
import React from "react";

export default function Dashboard() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Dashboard
      </Typography>
      <Box
        sx={(theme) => ({
          display: "grid",
          gap: theme.spacing(2),
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        })}
      >
        <DashboardWidget
          title="Flows"
          linkTarget="/app/flows"
          linkText="view all flows"
        >
          <i>flows content</i>
        </DashboardWidget>
        <DashboardWidget
          title="Notifications"
          linkTarget="/app/notifications"
          linkText="view all notifications"
        >
          <i>notifications content</i>
        </DashboardWidget>
        <DashboardWidget
          title="Feedback"
          linkTarget="/app/feedback"
          linkText="view all feedback"
        >
          <i>feedback content</i>
        </DashboardWidget>
        <DashboardWidget
          title="Activity"
          linkTarget="/app/activity"
          linkText="view analytics"
        >
          <i>activity content</i>
        </DashboardWidget>
      </Box>
    </Container>
  );
}
