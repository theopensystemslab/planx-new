import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import { WidgetLink } from "ui/editor/DashboardWidget";

const STATS = [
  { label: "Total sessions" },
  { label: "Submissions" },
  { label: "Guidance sessions" },
  { label: "Online flows" },
];

interface StatsBannerProps {
  team: string;
}

const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.border.light}`,
  padding: theme.spacing(1.5),
  marginTop: theme.spacing(4),
  marginBottom: theme.spacing(2),
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

export default function StatsBanner({ team }: StatsBannerProps) {
  return (
    <Root>
      <Header>
        <Typography variant="h3">Last 30 days</Typography>
        <WidgetLink to={`/app/${team}/analytics`}>view analytics</WidgetLink>
      </Header>
      <StatsGrid>
        {STATS.map(({ label }) => (
          <Box key={label}>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {label}
            </Typography>
            <Typography variant="h1" component="p">
              —
            </Typography>
          </Box>
        ))}
      </StatsGrid>
    </Root>
  );
}
