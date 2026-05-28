import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { linkOptions } from "@tanstack/react-router";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React from "react";
import { WidgetLink } from "ui/editor/DashboardWidget";

import { useStore } from "../../FlowEditor/lib/store";
import {
  TeamDashboardStats,
  useTeamDashboardStats,
} from "./useTeamDashboardStats";

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

interface StatsBannerProps {
  teamSlug: string;
  stats?: TeamDashboardStats;
  loading?: boolean;
}

export function StatsBanner({
  teamSlug,
  stats,
  loading = false,
}: StatsBannerProps) {
  const tiles = [
    {
      label: "Online flows",
      value: stats?.onlineFlows ?? null,
      delta: stats ? stats.onlineFlows - stats.onlineFlowsPrevious : null,
    },
    {
      label: "Total sessions",
      value: stats?.sessionsCurrent ?? null,
      delta: stats ? stats.sessionsCurrent - stats.sessionsPrevious : null,
    },
    {
      label: "Submissions",
      value: stats?.submissionsCurrent ?? null,
      delta: stats
        ? stats.submissionsCurrent - stats.submissionsPrevious
        : null,
    },
    {
      label: "Total guidance sessions",
      value: stats?.guidanceSessionsCurrent ?? null,
      delta: stats
        ? stats.guidanceSessionsCurrent - stats.guidanceSessionsPrevious
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
            params: { team: teamSlug },
          })}
        />
      </Header>
      {loading ? (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 72,
          }}
        >
          <DelayedLoadingIndicator inline msDelayBeforeVisible={300} />
        </Box>
      ) : (
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
      )}
    </Root>
  );
}

export default function ConnectedStatsBanner() {
  const teamSlug = useStore((state) => state.getTeam().slug);
  const { data, loading } = useTeamDashboardStats(teamSlug);
  const stats = data?.teamDashboardStats[0];

  return <StatsBanner teamSlug={teamSlug} stats={stats} loading={loading} />;
}
