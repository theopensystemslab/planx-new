import Box from "@mui/material/Box";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import CheckCircleIcon from "ui/icons/CheckCircle";

import type { SearchResult } from "./SearchResult";

interface SearchListItemProps {
  result: SearchResult;
  onClick?: () => void;
}

export const SearchListItem: React.FC<SearchListItemProps> = ({
  result: { icon, title, description, statusLabel },
  onClick,
}) => {
  const content = (
    <>
      <Box sx={{ mt: 0.25 }}>{icon}</Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.25,
          justifyContent: "center",
          minHeight: "56px",
        }}
      >
        {statusLabel && (
          <Box
            sx={{ display: "flex", alignItems: "center", gap: 0.33, mt: 0.5 }}
          >
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
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
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
        alignItems="flex-start"
        sx={{ px: 2, py: 1.5, gap: 1.5 }}
      >
        {content}
      </ListItemButton>
    );
  }

  return (
    <ListItem alignItems="flex-start" sx={{ px: 2, py: 1.5, gap: 1.5 }}>
      {content}
    </ListItem>
  );
};
