import SearchIcon from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import { useStore } from "../../pages/FlowEditor/lib/store";
import NumbersWidget from "./components/NumbersWidget";
import { SearchModal } from "./components/SearchModal";
import TemplatesWidget from "./components/TemplatesWidget";

const SearchBarButton = styled(ButtonBase)(({ theme }) => ({
  width: "100%",
  maxWidth: 360,
  height: 50,
  padding: theme.spacing(0, 2),
  gap: theme.spacing(1),
  justifyContent: "flex-start",
  border: `1px solid ${theme.palette.border.main}`,
  borderRadius: 4,
  backgroundColor: theme.palette.common.white,
  color: theme.palette.text.placeholder,
  "&:hover, &:focus-visible": {
    borderColor: theme.palette.text.primary,
  },
}));

export default function Explore() {
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
          <SearchBarButton
            onClick={() => setSearchOpen(true)}
            aria-label="Search Plan✕"
          >
            <SearchIcon />
            <Typography variant="body1" sx={{ color: "inherit" }}>
              Search flows across Plan✕
            </Typography>
          </SearchBarButton>
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
