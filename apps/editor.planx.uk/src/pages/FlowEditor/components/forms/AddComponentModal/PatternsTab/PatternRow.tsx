import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import React from "react";
import { focusStyle, FONT_WEIGHT_SEMI_BOLD } from "theme";

import { PatternPreview } from "./PatternPreview";
import type { Pattern } from "./queries";
import { componentCountLabel, getComponentCount } from "./utils";

const PREVIEW_SIZE = 48;

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
  const componentCount = getComponentCount(pattern.data);
  const countLabel = componentCountLabel(componentCount);

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
        alignItems: "flex-start",
        gap: 1,
        px: 1,
        py: 1.2,
        width: "100%",
        font: "inherit",
        color: "inherit",
        textAlign: "left",
        cursor: "pointer",
        border: 0,
        backgroundColor: active ? "action.hover" : "transparent",
        "&:hover": {
          backgroundColor: "action.hover",
        },
        "&:focus-visible": focusStyle,
      }}
    >
      {countLabel && (
        <Box
          sx={{
            flexShrink: 0,
            width: PREVIEW_SIZE,
            height: PREVIEW_SIZE,
            p: 0.5,
            border: 1,
            borderColor: "divider",
            borderRadius: 0.5,
            backgroundColor: "background.default",
          }}
        >
          <PatternPreview componentCount={componentCount} />
        </Box>
      )}
      <Box sx={{ minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{ fontWeight: FONT_WEIGHT_SEMI_BOLD, lineHeight: 1.3, pt: 0.25 }}
        >
          {pattern.name}
        </Typography>
        {countLabel && (
          <Typography
            variant="body3"
            sx={{ color: "text.secondary", lineHeight: 1.1 }}
            noWrap
          >
            {countLabel}
          </Typography>
        )}
      </Box>
    </Box>
  );
};
