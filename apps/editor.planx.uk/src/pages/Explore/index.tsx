import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { useStore } from "../../pages/FlowEditor/lib/store";
import NumbersWidget from "./components/NumbersWidget";
import { SearchModal } from "./components/SearchModal";
import TemplatesWidget from "./components/TemplatesWidget";

export default function Explore() {
  const team = useStore((state) => state.getTeam());
  const [searchOpen, setSearchOpen] = useState(false);

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
          <Button
            startIcon={<SearchIcon />}
            onClick={() => setSearchOpen(true)}
          >
            Search Plan✕
          </Button>
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
          <DashboardWidget title="Templates">
            <TemplatesWidget />
          </DashboardWidget>
        </Box>
      </Container>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Box>
  );
}
