import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { CustomLink } from "ui/shared/CustomLink/CustomLink";

const STATS = [
  { label: "Total sessions" },
  { label: "Submissions" },
  { label: "Guidance sessions" },
  { label: "Online flows" },
];

interface StatsBannerProps {
  teamSlug: string;
}

export default function StatsBanner({ teamSlug }: StatsBannerProps) {
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.palette.background.paper,
        border: `1px solid ${theme.palette.border.light}`,
        padding: theme.spacing(1.5),
        mt: 4,
        mb: 2,
      })}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "flex-start",
          gap: 2,
          alignItems: "baseline",
          mb: 1.5,
        }}
      >
        <Typography variant="h3">Last 30 days</Typography>
        <CustomLink
          to={`/app/${teamSlug}/analytics`}
          sx={(theme) => ({
            fontSize: theme.typography.body3.fontSize,
            color: theme.palette.text.secondary,
          })}
        >
          view analytics
        </CustomLink>
      </Box>
      <Box
        sx={(theme) => ({
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: theme.spacing(2),
          [theme.breakpoints.down("md")]: {
            gridTemplateColumns: "repeat(2, 1fr)",
          },
        })}
      >
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
      </Box>
    </Box>
  );
}
