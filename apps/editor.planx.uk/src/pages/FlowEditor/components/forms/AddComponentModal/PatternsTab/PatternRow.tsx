import Box from "@mui/material/Box";
import Typography, { typographyClasses } from "@mui/material/Typography";
import { focusStyle, FONT_WEIGHT_SEMI_BOLD } from "theme";

import type { Pattern } from "./queries";

interface Props {
  pattern: Pattern;
  active: boolean;
  onPreview: () => void;
  onSelect: () => void;
}

export const PatternRow: React.FC<Props> = ({
  pattern,
  active,
  onPreview,
  onSelect,
}) => {
  return (
    <Box
      component="button"
      type="button"
      onClick={onSelect}
      onMouseEnter={onPreview}
      onFocus={onPreview}
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
        backgroundColor: active ? "action.hover" : "transparent",
        "&:hover": {
          backgroundColor: "action.hover",
          [`& .${typographyClasses.root}`]: {
            fontWeight: FONT_WEIGHT_SEMI_BOLD,
          },
        },
        "&:focus-visible": focusStyle,
      }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: active ? FONT_WEIGHT_SEMI_BOLD : "regular" }}
        >
          {pattern.name}
        </Typography>
      </Box>
    </Box>
  );
};
