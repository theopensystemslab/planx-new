import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { linkOptions } from "@tanstack/react-router";
import { DEFAULT_PRIMARY_COLOR } from "theme";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { useStore } from "../../pages/FlowEditor/lib/store";
import ActivityWidget from "./components/ActivityWidget";
import FeedbackWidget from "./components/FeedbackWidget";
import FlowsPanel from "./components/FlowsPanel";
import ConnectedNotificationsWidget from "./components/NotificationsWidget";
import StatsBanner from "./components/StatsBanner";

export default function Dashboard() {
  const team = useStore((state) => state.getTeam());
  const muiTheme = useTheme();

  const mastheadBg = team.theme?.primaryColour ?? DEFAULT_PRIMARY_COLOR;
  return (
    <Box sx={{ bgcolor: "background.paper", flexGrow: 1 }}>
      <Box sx={{ bgcolor: mastheadBg, py: 3 }}>
        <Container
          maxWidth="contentWide"
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          {team.theme?.logo ? (
            <Box
              component="img"
              src={team.theme.logo}
              alt={team.name}
              sx={{
                maxWidth: 160,
                width: "100%",
                height: 60,
                objectFit: "contain",
                objectPosition: "left",
                display: "block",
              }}
            />
          ) : (
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{ color: muiTheme.palette.getContrastText(mastheadBg) }}
            >
              {team.name}
            </Typography>
          )}
          <StatsBanner />
        </Container>
      </Box>
      <Container
        maxWidth="contentWide"
        // Override default container padding to align with widgets
        sx={{ py: "30px !important" }}
      >
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
          <DashboardWidget title="Activity" subtitle="Last 30 days">
            <ActivityWidget />
          </DashboardWidget>
        </Box>
      </Container>
    </Box>
  );
}
