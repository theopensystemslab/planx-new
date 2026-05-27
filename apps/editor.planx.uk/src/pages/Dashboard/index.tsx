import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { useStore } from "../../pages/FlowEditor/lib/store";
import StatsBanner from "./components/StatsBanner";

export default function Dashboard() {
  const team = useStore((state) => state.getTeam());

  return (
    <Box sx={{ bgcolor: "background.paper", flexGrow: 1 }}>
      <Container maxWidth="contentWide" sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          {team.name}
        </Typography>
        <StatsBanner team={team.slug} />
        <Box
          sx={(theme) => ({
            display: "grid",
            gap: theme.spacing(2),
            gridTemplateColumns: "repeat(auto-fit, minmax(470px, 1fr))",
          })}
        >
          <DashboardWidget
            title="Flows"
            linkTarget={`/app/${team.slug}/flows`}
            linkText="view all flows"
          >
            <i>flows content</i>
          </DashboardWidget>
          <DashboardWidget
            title="Notifications"
            linkTarget={`/app/${team.slug}/notifications`}
            linkText="view all notifications"
          >
            <i>notifications content</i>
          </DashboardWidget>
          <DashboardWidget
            title="Feedback"
            linkTarget={`/app/${team.slug}/feedback`}
            linkText="view all feedback"
          >
            <i>feedback content</i>
          </DashboardWidget>
          <DashboardWidget
            title="Activity"
            linkTarget={`/app/${team.slug}/activity`}
            linkText="view analytics"
          >
            <i>activity content</i>
          </DashboardWidget>
        </Box>
      </Container>
    </Box>
  );
}
