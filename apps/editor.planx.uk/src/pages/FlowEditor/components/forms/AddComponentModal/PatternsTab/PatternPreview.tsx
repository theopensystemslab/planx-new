import Box from "@mui/material/Box";
import { grey } from "@mui/material/colors";
import type { SxProps, Theme } from "@mui/material/styles";
import React from "react";

// Cycling bar widths, one per component
const BAR_WIDTHS = ["60%", "70%", "80%", "65%"];

// Cap the amount of bars to avoid overflowing preview container
const MAX_BARS = 14;

interface Props {
  componentCount: number;
  sx?: SxProps<Theme>;
}

/**
 * Semi-abstract stack of bars representing a pattern's components: one bar per
 * component (up to MAX_BARS), cycling through varying widths, filling the
 * full height of its container
 */
export const PatternPreview: React.FC<Props> = ({ componentCount, sx }) => {
  if (componentCount < 1) return null;

  const barCount = Math.min(componentCount, MAX_BARS);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        gap: "4%",
        height: "100%",
        ...sx,
      }}
    >
      {Array.from({ length: barCount }, (_, i) => (
        <Box
          key={i}
          sx={{
            flex: 1,
            minHeight: 0,
            maxHeight: "12%",
            width: BAR_WIDTHS[i % BAR_WIDTHS.length],
            backgroundColor: grey[800],
          }}
        />
      ))}
    </Box>
  );
};
