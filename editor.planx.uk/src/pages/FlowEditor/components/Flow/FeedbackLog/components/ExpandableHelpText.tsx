import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { GridCellParams } from "@mui/x-data-grid";
import React, { useState } from "react";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { getCombinedHelpText } from "../utils";

export const ExpandableHelpText = (props: GridCellParams) => {
  const { row } = props;

  const { truncated: truncatedHelpText, full: fullHelpText } =
    getCombinedHelpText(row);
  const [expandedHelpText, setExpandedHelpText] = useState<boolean>(false);
  return (
    <Box>
      <ReactMarkdownOrHtml
        source={expandedHelpText ? fullHelpText : truncatedHelpText}
      />
      {fullHelpText && (
        <Button
          onClick={() => {
            setExpandedHelpText(!expandedHelpText);
          }}
        >
          {expandedHelpText ? "Close" : "Expand"}
        </Button>
      )}
    </Box>
  );
};
