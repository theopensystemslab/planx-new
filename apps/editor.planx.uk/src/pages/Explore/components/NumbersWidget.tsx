import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import { EmptyLoadingBar, LoadingBar } from "ui/editor/LoadingBar";
import { formatDelta } from "utils";

export interface NumbersWidgetStats {
  lpasOnPlanX: number;
  lpasOnPlanXPrevious: number;
  onlineServices: number;
  onlineServicesPrevious: number;
  totalSessions: number;
  totalSessionsPrevious: number;
  totalSubmissions: number;
  totalSubmissionsPrevious: number;
}

interface NumbersWidgetProps {
  stats?: NumbersWidgetStats;
  loading?: boolean;
}

// Container for loading bar to keep it aligned when data is present
const LoadingBarContainer = styled(Box)({
  height: 56,
  display: "flex",
  alignItems: "flex-end",
  paddingBottom: "7px",
});

interface StatValueProps {
  loading: boolean;
  value: number | null;
  label: string;
}

function StatValue({ loading, value, label }: StatValueProps) {
  if (loading) {
    return (
      <LoadingBarContainer>
        <LoadingBar aria-label={`Loading ${label}`} />
      </LoadingBarContainer>
    );
  }
  if (value !== null) {
    return (
      // Fixed size and height to keep layout consistent
      <Typography
        variant="h1"
        component="p"
        sx={{
          height: 56,
          lineHeight: 1.35,
          fontSize: "3rem !important",
        }}
      >
        {value.toLocaleString("en-GB")}
      </Typography>
    );
  }
  return (
    <LoadingBarContainer>
      <EmptyLoadingBar />
    </LoadingBarContainer>
  );
}

export function NumbersWidget({ stats, loading = false }: NumbersWidgetProps) {
  const rows = [
    {
      label: "LPAs on PlanX",
      value: stats?.lpasOnPlanX ?? null,
      delta: stats ? stats.lpasOnPlanX - stats.lpasOnPlanXPrevious : null,
    },
    {
      label: "online services",
      value: stats?.onlineServices ?? null,
      delta: stats ? stats.onlineServices - stats.onlineServicesPrevious : null,
    },
    {
      label: "total sessions",
      value: stats?.totalSessions ?? null,
      delta: stats ? stats.totalSessions - stats.totalSessionsPrevious : null,
    },
    {
      label: "total submissions",
      value: stats?.totalSubmissions ?? null,
      delta: stats
        ? stats.totalSubmissions - stats.totalSubmissionsPrevious
        : null,
    },
  ];

  return (
    <Box sx={{ display: "flex", flexDirection: "column", overflow: "hidden" }}>
      <Box sx={{ overflowY: "auto" }}>
        {rows.map(({ label, value, delta }, index) => (
          <React.Fragment key={label}>
            <Box sx={{ px: 2, pb: 1.25, pt: 1.25 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "flex-end",
                  gap: 1,
                }}
              >
                <StatValue loading={loading} value={value} label={label} />
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {label}
                </Typography>
                {!loading && delta !== null && delta !== 0 && (
                  <Typography
                    variant="body2"
                    sx={{
                      color: delta > 0 ? "success.main" : "error.main",
                      fontWeight: "bold",
                    }}
                  >
                    {formatDelta(delta)}
                  </Typography>
                )}
              </Box>
            </Box>
            {index < rows.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </Box>
    </Box>
  );
}

export default function ConnectedNumbersWidget() {
  return <NumbersWidget />;
}
