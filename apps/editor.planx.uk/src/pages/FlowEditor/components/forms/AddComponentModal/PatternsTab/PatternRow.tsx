import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { focusStyle, FONT_WEIGHT_SEMI_BOLD } from "theme";

import type { Pattern } from ".";

interface Props {
  pattern: Pattern;
  selected: boolean;
  onClick: () => void;
}

export const PatternRow: React.FC<Props> = ({ pattern, selected, onClick }) => {
  return (
    <Box
      component="button"
      type="button"
      onClick={onClick}
      data-testid={`pattern-${pattern.id}`}
      aria-current={selected}
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 1.5,
        pl: 1.5,
        pr: 1.5,
        py: 1,
        width: "100%",
        font: "inherit",
        color: "inherit",
        textAlign: "left",
        cursor: "pointer",
        border: 0,
        borderLeft: "3px solid",
        borderLeftColor: selected ? "info.main" : "transparent",
        backgroundColor: selected ? "action.selected" : "transparent",
        "&:hover": {
          backgroundColor: selected ? "action.selected" : "action.hover",
        },
        "&:focus-visible": focusStyle,
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
