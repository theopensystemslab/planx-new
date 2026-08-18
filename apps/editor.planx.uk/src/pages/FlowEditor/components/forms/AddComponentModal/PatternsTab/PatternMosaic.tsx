import Box from "@mui/material/Box";
import React from "react";

import type { PatternCounts } from "./utils";
import { getPatternMosaic } from "./utils";

// Colour palette, based on the pattern lime green
const MOSAIC_PALETTE = [
  "#28d1de",
  "#6bc5b5",
  "#90cfaa",
  "#8cd48b",
  "#96d788",
  "#a2da85",
  "#aeda8d",
  "#bcd996",
  "#d4e7a3",
  "#e7f2ab",
];

const CELL_SIZE = 36;
const GAP = 0.12;

interface Props {
  seed: string;
  counts: PatternCounts;
}

// Renders a pattern's mosaic as a self-contained SVG
export const PatternMosaic: React.FC<Props> = ({ seed, counts }) => {
  const mosaic = getPatternMosaic(seed, counts);

  if (mosaic.cols === 0 || mosaic.rows === 0) return null;

  return (
    <Box
      component="svg"
      viewBox={`0 0 ${mosaic.cols} ${mosaic.rows}`}
      sx={{
        display: "block",
        aspectRatio: `${mosaic.cols} / ${mosaic.rows}`,
        width: mosaic.cols * CELL_SIZE,
        maxWidth: "70%",
        maxHeight: "60%",
      }}
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
