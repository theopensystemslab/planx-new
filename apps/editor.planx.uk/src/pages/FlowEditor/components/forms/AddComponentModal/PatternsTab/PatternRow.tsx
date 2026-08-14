import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { focusStyle, FONT_WEIGHT_SEMI_BOLD } from "theme";

import type { Pattern } from "./queries";

interface Props {
  pattern: Pattern;
  onSelect: () => void;
}

export const PatternRow: React.FC<Props> = ({ pattern, onSelect }) => {
  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      data-testid={`pattern-${pattern.id}`}
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
        backgroundColor: "background.paper",
        "&:hover": {
          backgroundColor: "action.hover",
        },
        "&:focus-visible": focusStyle,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD }}>
          {pattern.name}
        </Typography>
        <Typography variant="body3" color="textSecondary" component="p">
          {pattern.summary}
        </Typography>
      </Box>
    </Box>
  );
};
