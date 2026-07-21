import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import React from "react";

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
}

function formatDelta(delta: number): string {
  const formatted = Math.abs(delta).toLocaleString("en-GB");
  return delta >= 0 ? `+${formatted}` : `-${formatted}`;
}

export function NumbersWidget({ stats }: NumbersWidgetProps) {
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
            <Box sx={{ px: 2, pb: 1, pt: 1.5 }}>
              <Box sx={{ display: "flex", alignItems: "baseline", gap: 1 }}>
                <Typography variant="h1" component="p">
                  {value !== null ? value.toLocaleString("en-GB") : "—"}
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  {label}
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
