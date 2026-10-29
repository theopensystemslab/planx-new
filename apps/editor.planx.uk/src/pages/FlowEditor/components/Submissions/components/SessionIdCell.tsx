import CheckIcon from "@mui/icons-material/Check";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { gridClasses } from "@mui/x-data-grid";
import React, { useState } from "react";
import type { RenderCellParams } from "ui/shared/DataTable/types";

interface CopySessionIdButtonProps {
  sessionId: string;
  tabIndex: -1 | 0;
}

const CopySessionIdButton: React.FC<CopySessionIdButtonProps> = ({
  sessionId,
  tabIndex,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = (event: React.MouseEvent) => {
    event.stopPropagation();
    navigator.clipboard.writeText(sessionId);
    setIsCopied(true);
  };

  return (
    <Tooltip title={isCopied ? "Copied" : "Copy session ID"}>
      <IconButton
        size="small"
        aria-label="Copy session ID"
        tabIndex={tabIndex}
        onClick={handleCopy}
        onMouseLeave={() => setIsCopied(false)}
        sx={{
          opacity: 0,
          [`.${gridClasses.row}:hover &, .${gridClasses.row}:focus-within &`]: {
            opacity: 1,
          },
        }}
      >
        {isCopied ? (
          <CheckIcon fontSize="small" />
        ) : (
          <ContentCopyIcon fontSize="small" />
        )}
      </IconButton>
    </Tooltip>
  );
};

export const SessionIdCell = (params: RenderCellParams) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
    {params.value}
    <CopySessionIdButton
      sessionId={String(params.value)}
      tabIndex={params.tabIndex}
    />
  </Box>
);
