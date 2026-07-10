import Box from "@mui/material/Box";
import { useTheme } from "@mui/material/styles";
import React from "react";

import type { PatternGraphLayout } from "./buildPatternGraphLayout";

const PADDING = 4;

interface PatternThumbnailProps {
  layout: PatternGraphLayout | null;
  size?: number;
}

export const PatternThumbnail: React.FC<PatternThumbnailProps> = ({
  layout,
  size = 40,
}) => {
  const theme = useTheme();
  const hasNodes = Boolean(layout?.nodes.length);

  return (
    <Box
      sx={{
        flexShrink: 0,
        width: size,
        height: size,
        borderRadius: 0.5,
        border: 1,
        borderColor: "divider",
        backgroundColor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {hasNodes && layout && (
        <svg
          width="100%"
          height="100%"
          viewBox={`${-PADDING} ${-PADDING} ${layout.width + PADDING * 2} ${layout.height + PADDING * 2}`}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        >
          {layout.edges.map(({ from, to }) => (
            <line
              key={`${from.id}-${to.id}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={theme.palette.divider}
              strokeWidth={1}
            />
          ))}
          {layout.nodes.map((node) => (
            <circle
              key={node.id}
              cx={node.x}
              cy={node.y}
              r={2}
              fill={theme.palette.primary.main}
            />
          ))}
        </svg>
      )}
    </Box>
  );
};
