import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

import type { Pattern } from ".";

interface Props {
  pattern: Pattern;
  selected: boolean;
  onClick: () => void;
}

export const PatternRow: React.FC<Props> = ({ pattern, selected, onClick }) => {
  return (
    <Box
      onClick={onClick}
      data-testid={`pattern-${pattern.id}`}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        pl: 1.5,
        pr: 1.5,
        py: 1,
        cursor: "pointer",
        borderLeft: "3px solid",
        borderLeftColor: selected ? "info.main" : "transparent",
        backgroundColor: selected ? "action.selected" : "transparent",
        "&:hover": {
          backgroundColor: selected ? "action.selected" : "action.hover",
        },
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}
          noWrap
        >
          {pattern.name}
        </Typography>
      </Box>
    </Box>
  );
};
