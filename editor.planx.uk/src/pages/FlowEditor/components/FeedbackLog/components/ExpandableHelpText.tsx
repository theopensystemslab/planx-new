import Box from "@mui/material/Box";
import { GridCellParams } from "@mui/x-data-grid";
import SimpleExpand from "@planx/components/shared/Preview/SimpleExpand";
import React from "react";
import ReactMarkdownOrHtml from "ui/shared/ReactMarkdownOrHtml/ReactMarkdownOrHtml";

import { getCombinedHelpText } from "../utils";

export const ExpandableHelpText = (props: GridCellParams) => {
  const { row } = props;

  const { truncated: truncatedHelpText, full: fullHelpText } =
    getCombinedHelpText(row);
  return (
    <Box>
      <ReactMarkdownOrHtml source={truncatedHelpText} />

      {fullHelpText && (
        <SimpleExpand
          id="expanded-help-text"
          buttonText={{
            open: "See full text",
            closed: "Hide full text",
          }}
        >
          <ReactMarkdownOrHtml source={fullHelpText} />
        </SimpleExpand>
      )}
    </Box>
  );
};
