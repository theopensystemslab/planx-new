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
    <Box sx={{ "& p": { mt: 0 } }}>
      <ReactMarkdownOrHtml source={truncatedHelpText} />

      {fullHelpText && (
        <SimpleExpand
          id="expanded-help-text"
          buttonText={{
            open: "See full text",
            closed: "Hide full text",
          }}
        >
          <Box sx={{ "& p": { marginTop: "0.5em" } }}>
            <ReactMarkdownOrHtml source={fullHelpText} />
          </Box>
        </SimpleExpand>
      )}
    </Box>
  );
};
