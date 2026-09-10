import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import CheckCircleIcon from "ui/icons/CheckCircle";

import type { SearchResult } from "./SearchResult";

interface SearchListItemProps {
  result: SearchResult;
  onClick?: () => void;
  selected?: boolean;
}

export const SearchListItem: React.FC<SearchListItemProps> = ({
  result: { icon, title, description, statusLabel },
  onClick,
  selected,
}) => {
  const content = (
    <>
      <Box>{icon}</Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
          justifyContent: "center",
          minHeight: "56px",
          pt: 0.33,
        }}
      >
        {statusLabel && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.33 }}>
            <CheckCircleIcon color="success" sx={{ fontSize: 18 }} />
            <Typography
              variant="body3"
              sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
            >
              {statusLabel}
            </Typography>
          </Box>
        )}
        <Typography variant="body1" sx={{ fontWeight: "bold" }}>
          {title}
        </Typography>
        {description && (
          <Typography variant="body3" sx={{ color: "text.secondary" }}>
            {description}
          </Typography>
        )}
      </Box>
    </>
  );

  if (onClick) {
    return (
      <ListItemButton
        onClick={onClick}
        alignItems="center"
        selected={selected}
        sx={{ px: 2, py: 1.5, gap: 1.5 }}
      >
        {content}
        <ChevronRightIcon sx={{ ml: "auto", color: "text.secondary" }} />
      </ListItemButton>
    );
  }

  return (
    <ListItem alignItems="flex-start" sx={{ px: 2, py: 1.5, gap: 1.5 }}>
      {content}
    </ListItem>
  );
};
