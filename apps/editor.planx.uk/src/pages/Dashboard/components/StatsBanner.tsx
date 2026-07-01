import Box from "@mui/material/Box";
import MuiLink from "@mui/material/Link";
import { keyframes, styled, type Theme } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { useTeamAnalyticsLink } from "hooks/analyticsLinks/useTeamAnalyticsLink";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

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
  zIndex: 1,
  borderRadius: theme.shape.borderRadius,
}));

const Header = styled(Box)(({ theme }) => ({
  display: "flex",
  justifyContent: "flex-start",
  gap: 16,
  alignItems: "baseline",
  marginBottom: theme.spacing(1),
  paddingBottom: theme.spacing(1.5),
  borderBottom: `1px solid ${theme.palette.border.light}`,
}));

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
`;

const StatsGrid = styled(Box)(({ theme }) => ({
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: theme.spacing(2),
  [theme.breakpoints.down("md")]: {
    gridTemplateColumns: "repeat(2, 1fr)",
  },
}));

function formatDelta(delta: number): string {
  const formatted = Math.abs(delta).toLocaleString("en-GB");
  return delta >= 0 ? `+${formatted}` : `-${formatted}`;
}

const analyticsLinkBase = (theme: Theme) => ({
  fontSize: theme.typography.body2.fontSize,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
});

const AnalyticsLink = styled(MuiLink)(({ theme }) => ({
  ...analyticsLinkBase(theme),
  color: theme.palette.text.primary,
  "&:hover": { textDecorationThickness: "2px" },
}));

const AnalyticsLinkDisabled = styled(Typography)(({ theme }) => ({
  ...analyticsLinkBase(theme),
  color: theme.palette.text.disabled,
  cursor: "default",
}));

interface StatsBannerProps {
  analyticsLink?: string;
  stats?: TeamDashboardStats;
  loading?: boolean;
}

export function StatsBanner({
  analyticsLink,
  stats,
  loading = false,
}: StatsBannerProps) {
  const tiles = [
    {
      label: "Online services",
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
        <Typography variant="h4" component="h2">
          Last 30 days
        </Typography>
        {analyticsLink ? (
          <AnalyticsLink
            href={analyticsLink}
            target="_blank"
            rel="noopener noreferrer"
            underline="always"
          >
            view analytics
          </AnalyticsLink>
        ) : (
          <Tooltip title="Analytics unavailable" placement="bottom">
            <AnalyticsLinkDisabled variant="body2">
              view analytics
            </AnalyticsLinkDisabled>
          </Tooltip>
        )}
      </Header>
      <StatsGrid>
        {tiles.map(({ label, value, delta }) => (
          <Box key={label}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {label}
            </Typography>
            <Typography
              variant="h1"
              component="p"
              sx={
                loading
                  ? { animation: `${pulse} 1.4s ease-in-out infinite` }
                  : undefined
              }
            >
              {value !== null ? value.toLocaleString("en-GB") : "—"}
            </Typography>
            {!loading && delta !== null && (
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

export default function ConnectedStatsBanner() {
  const teamSlug = useStore((state) => state.getTeam().slug);
  const { data, loading } = useTeamDashboardStats(teamSlug);
  const stats = data?.teamDashboardStats[0];
  const analyticsLink = useTeamAnalyticsLink();

  return (
    <StatsBanner
      analyticsLink={analyticsLink}
      stats={stats}
      loading={loading}
    />
  );
}
