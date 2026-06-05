import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { linkOptions } from "@tanstack/react-router";
import React from "react";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { useStore } from "../../pages/FlowEditor/lib/store";
import FlowsPanel from "./components/FlowsPanel";
import ConnectedNotificationsWidget from "./components/NotificationsWidget";
import FeedbackWidget from "./components/FeedbackWidget";
import ActivityWidget from "./components/ActivityWidget";
import StatsBanner from "./components/StatsBanner";

export default function Dashboard() {
  const team = useStore((state) => state.getTeam());

  return (
    <Box sx={{ bgcolor: "background.paper", flexGrow: 1 }}>
      <Container maxWidth="contentWide" sx={{ py: 4 }}>
        <Typography variant="h2" component="h1" gutterBottom>
          {team.name}
        </Typography>
        <StatsBanner />
        <Box
          sx={(theme) => ({
            display: "grid",
            gap: theme.spacing(2),
            gridTemplateColumns: "repeat(auto-fit, minmax(470px, 1fr))",
          })}
        >
          <DashboardWidget
            title="Flows"
            link={linkOptions({
              to: "/app/$team",
              params: { team: team.slug },
              label: "view all flows",
            })}
          >
            <FlowsPanel />
          </DashboardWidget>
          <ConnectedNotificationsWidget />
          <DashboardWidget
            title="Feedback"
            link={linkOptions({
              to: "/app/$team/feedback",
              params: { team: team.slug },
              label: "view all feedback",
            })}
          >
            <FeedbackWidget />
          </DashboardWidget>
          <DashboardWidget title="Activity">
            <ActivityWidget />
          </DashboardWidget>
        </Box>
      </Container>
    </Box>
  );
}
