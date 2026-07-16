import Box from "@mui/material/Box";
import type { Graph } from "@planx/graph";
import React, { useCallback, useState } from "react";

import {
  getCachedPatternThumbnail,
  PatternFlowThumbnailCapture,
} from "./PatternFlowThumbnailCapture";

interface PatternThumbnailImageProps {
  patternId: string;
  graph: Graph | null;
  width?: number | string;
  height?: number | string;
}

/**
 * Shows a cached snapshot of a pattern's real flow-editor rendering
 * (see PatternFlowThumbnailCapture), capturing it off-screen the first
 * time a given pattern is shown and reusing it after that.
 */
export const PatternThumbnailImage: React.FC<PatternThumbnailImageProps> = ({
  patternId,
  graph,
  width = "100%",
  height = 140,
}) => {
  const [dataUrl, setDataUrl] = useState<string | undefined>(() =>
    getCachedPatternThumbnail(patternId),
  );
  const handleCapture = useCallback((url: string) => setDataUrl(url), []);

  return (
    <Box
      sx={{
        width,
        height,
        flexShrink: 0,
        borderRadius: 0.5,
        border: 1,
        borderColor: "border.dark",
        backgroundColor: "background.default",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "hidden",
      }}
    >
      {dataUrl && (
        <Box
          component="img"
          src={dataUrl}
          alt=""
          sx={{ width: "100%", height: "100%", objectFit: "contain" }}
        />
      )}
      {!dataUrl && graph && (
        <PatternFlowThumbnailCapture
          patternId={patternId}
          graph={graph}
          onCapture={handleCapture}
        />
      )}
    </Box>
  );
};
