import Box from "@mui/material/Box";
import { cardBoxShadow } from "theme";

import { SearchListItemDetailActions } from "./SearchListItemDetailActions";
import type { SearchResult } from "./SearchResult";

interface DetailsPanelCardProps {
  primaryAction?: SearchResult["primaryAction"];
  secondaryAction?: SearchResult["secondaryAction"];
  children: React.ReactNode;
}

export const DetailsPanelCard: React.FC<DetailsPanelCardProps> = ({
  primaryAction,
  secondaryAction,
  children,
}) => (
  <Box
    sx={(theme) => ({
      maxHeight: "100%",
      display: "flex",
      flexDirection: "column",
      border: `1px solid ${theme.palette.border.light}`,
      borderRadius: 1,
      boxShadow: cardBoxShadow,
      backgroundColor: theme.palette.background.default,
    })}
  >
    <Box sx={{ flex: 1, minHeight: 0, overflowY: "auto", py: 2.5, px: 2 }}>
      {children}
    </Box>
    <SearchListItemDetailActions
      primaryAction={primaryAction}
      secondaryAction={secondaryAction}
    />
  </Box>
);
