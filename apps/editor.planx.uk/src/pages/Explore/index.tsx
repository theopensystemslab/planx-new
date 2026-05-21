import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import React from "react";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { useStore } from "../../pages/FlowEditor/lib/store";

export default function Explore() {
  const team = useStore((state) => state.getTeam());

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h2" component="h1" gutterBottom>
        Explore
      </Typography>
      <Box
        sx={(theme) => ({
          display: "grid",
          gap: theme.spacing(2),
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
        })}
      >
        <DashboardWidget
          title="Templates"
          linkText="view all templates"
          linkTarget={`/app/${team.slug}/flows?templates=source+template`}
        >
          <i>templates content</i>
        </DashboardWidget>
        <DashboardWidget
          title="Help and resources"
          linkText="view all help and resources"
          linkTarget={`/app/${team.slug}/resources`}
        >
          <i>resources content</i>
        </DashboardWidget>
        <DashboardWidget
          title="Available content"
          linkText="view analytics"
          linkTarget={`/app/${team.slug}/analytics`}
        >
          <i>available content</i>
        </DashboardWidget>
      </Box>
    </Container>
  );
}
