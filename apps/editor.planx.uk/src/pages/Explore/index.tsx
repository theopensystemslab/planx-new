import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { linkOptions } from "@tanstack/react-router";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { useStore } from "../../pages/FlowEditor/lib/store";
import NumbersWidget from "./components/NumbersWidget";

export default function Explore() {
  const team = useStore((state) => state.getTeam());

  return (
    <Box sx={{ bgcolor: "background.paper", flexGrow: 1 }}>
      <Container maxWidth="contentWide">
        <Box
          sx={{
            display: "flex",
            flexDirection: "row",
            gap: 2,
            justifyContent: "space-between",
            alignItems: "center",
            pb: 2,
          }}
        >
          <Typography variant="h2" component="h1">
            Explore Plan✕
          </Typography>
          {/* TODO: Style search button */}
          <Button>Search PlanX</Button>
        </Box>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            py: 2,
            gridTemplateColumns: "repeat(auto-fit, minmax(470px, 1fr))",
          }}
        >
          <DashboardWidget title="Plan✕ in numbers" subtitle="last 30 days">
            <NumbersWidget />
          </DashboardWidget>
          <DashboardWidget
            title="Featured templates"
            link={linkOptions({
              // TODO: Update to point to filtered search view for templates
              to: "/app/$team/flows",
              params: { team: team.slug },
              label: "view all templates",
            })}
          >
            <i>templates content</i>
          </DashboardWidget>
        </Box>
      </Container>
    </Box>
  );
}
