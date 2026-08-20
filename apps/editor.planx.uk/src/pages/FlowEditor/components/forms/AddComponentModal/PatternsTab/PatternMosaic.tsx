import Box from "@mui/material/Box";
import type { SxProps, Theme } from "@mui/material/styles";
import React from "react";

import type { PatternCounts } from "./utils";
import { getPatternMosaic } from "./utils";

/** Colour palette, based on a transition between PlanX blue and pattern lime green */
const MOSAIC_PALETTE = [
  "#c7e2a0",
  "#acdb9a",
  "#a6d2a7",
  "#91c4b3",
  "#74a8b1",
  "#517aac",
  "#3a52b1",
  "#3b44a7",
  "#3f38a1",
  "#362f8b",
];

const CELL_SIZE = 36;
const GAP = 0.12;

interface Props {
  seed: string;
  counts: PatternCounts;
  sx?: SxProps<Theme>;
}

/** Renders a pattern's mosaic as a self-contained SVG */
export const PatternMosaic: React.FC<Props> = ({ seed, counts, sx }) => {
  const mosaic = getPatternMosaic(seed, counts, MOSAIC_PALETTE.length);

  if (mosaic.cols === 0 || mosaic.rows === 0) return null;

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${mosaic.cols} ${mosaic.rows}`}
      sx={[
        {
          display: "block",
          aspectRatio: `${mosaic.cols} / ${mosaic.rows}`,
          width: mosaic.cols * CELL_SIZE,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {mosaic.squares.map((square, i) => (
        <rect
          key={i}
          x={square.x + GAP / 2}
          y={square.y + GAP / 2}
          width={square.size - GAP}
          height={square.size - GAP}
          fill={MOSAIC_PALETTE[square.colorIndex % MOSAIC_PALETTE.length]}
        />
      ))}
    </Box>
  );
};
