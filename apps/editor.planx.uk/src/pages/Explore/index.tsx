import Search from "@mui/icons-material/Search";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useState } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import { DashboardWidget } from "ui/editor/DashboardWidget";

import CalendarWidget, {
  CalendarViewToggle,
} from "./components/CalendarWidget";
import NumbersWidget from "./components/NumbersWidget";
import { SearchModal } from "./components/SearchModal";
import TemplatesWidget from "./components/TemplatesWidget";

const SearchBarButton = styled(ButtonBase)(({ theme }) => ({
  padding: theme.spacing(1.5, 2.5, 1.5, 2),
  gap: theme.spacing(1),
  justifyContent: "flex-start",
  border: `1px solid ${theme.palette.border.main}`,
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.common.white,
  "&:hover, &:focus-visible": {
    backgroundColor: theme.palette.background.paper,
  },
  "& > svg": {
    color: theme.palette.text.secondary,
  },
}));

export default function Explore() {
  const [searchOpen, setSearchOpen] = useState(false);

  const isProduction = import.meta.env.VITE_APP_ENV === "production";

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
            <Search />
            <Typography
              component="span"
              variant="body1"
              sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
            >
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
          {isProduction && (
            <DashboardWidget title="Plan✕ in numbers" subtitle="last 30 days">
              <NumbersWidget />
            </DashboardWidget>
          )}
          <DashboardWidget title="Templates">
            <TemplatesWidget />
          </DashboardWidget>
          <DashboardWidget
            title="Events & learning sessions"
            headerAction={<CalendarViewToggle />}
          >
            <CalendarWidget />
          </DashboardWidget>
        </Box>
      </Container>
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </Box>
  );
}
