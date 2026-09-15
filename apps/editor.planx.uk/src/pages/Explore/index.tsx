import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import CalendarWidget, {
  CALENDAR_VIEW_LABELS,
  type CalendarView,
} from "./components/CalendarWidget";

const CALENDAR_VIEWS: CalendarView[] = ["grid", "week", "list"];

export default function Explore() {
  return (
    <Box sx={{ bgcolor: "background.paper", flexGrow: 1 }}>
      <Container maxWidth="contentWide">
        <Box sx={{ pb: 2 }}>
          <Typography variant="h2" component="h1">
            Calendar view options
          </Typography>
        </Box>
        <Box
          sx={{
            display: "grid",
            gap: 2,
            py: 2,
            gridTemplateColumns: "repeat(auto-fit, minmax(470px, 1fr))",
          }}
        >
          {CALENDAR_VIEWS.map((view) => (
            <DashboardWidget key={view} title={CALENDAR_VIEW_LABELS[view]}>
              <CalendarWidget view={view} />
            </DashboardWidget>
          ))}
        </Box>
      </Container>
    </Box>
  );
}
