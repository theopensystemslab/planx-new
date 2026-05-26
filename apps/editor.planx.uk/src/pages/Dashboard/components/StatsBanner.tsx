import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { linkOptions } from "@tanstack/react-router";
import React from "react";
import { WidgetLink } from "ui/editor/DashboardWidget";

import { useTeamDashboardStats } from "./useTeamDashboardStats";

interface StatsBannerProps {
  team: string;
}

const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.border.light}`,
  position: "relative",
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
  zIndex: 1,
}));

const Header = styled(Box)({
  display: "flex",
  justifyContent: "flex-start",
  gap: 16,
  alignItems: "baseline",
  marginBottom: 12,
});

const StatsGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
}));

function formatDelta(delta: number): string {
  return delta >= 0 ? `+${delta}` : `${delta}`;
}

export default function StatsBanner({ team }: StatsBannerProps) {
  const { data } = useTeamDashboardStats(team);

  const stats = data?.team_dashboard_stats[0];

  const tiles = [
    {
      label: "Online flows",
      value: stats?.online_flows ?? null,
      delta: stats ? stats.online_flows - stats.online_flows_previous : null,
    },
    {
      label: "Total sessions",
      value: stats?.sessions_current ?? null,
      delta: stats ? stats.sessions_current - stats.sessions_previous : null,
    },
    {
      label: "Submissions",
      value: stats?.submissions_current ?? null,
      delta: stats
        ? stats.submissions_current - stats.submissions_previous
        : null,
    },
    {
      label: "Total guidance sessions",
      value: stats?.guidance_sessions_current ?? null,
      delta: stats
        ? stats.guidance_sessions_current - stats.guidance_sessions_previous
        : null,
    },
  ];

  return (
    <Root>
      <Header>
        <Typography variant="h3">Last 30 days</Typography>
        <WidgetLink
          label="view analytics"
          {...linkOptions({
            to: "/app/$team",
            params: { team },
          })}
        />
      </Header>
      <StatsGrid>
        {tiles.map(({ label, value, delta }) => (
          <Box key={label}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {label}
            </Typography>
            <Typography variant="h1" component="p">
              {value ?? "—"}
            </Typography>
            {delta !== null && (
              <Typography
                variant="body2"
                sx={{
                  color: delta >= 0 ? "success.main" : "error.main",
                  fontWeight: "bold",
                }}
              >
                {formatDelta(delta)}
              </Typography>
            )}
          </Box>
        ))}
      </StatsGrid>
    </Root>
  );
}
