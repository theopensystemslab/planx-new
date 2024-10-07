import Box from "@mui/material/Box";
import { visuallyHidden } from "@mui/utils";
import { NodeTag } from "@opensystemslab/planx-core/types";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const TAG_DISPLAY_VALUES: Record<
  NodeTag,
  { color: string; displayName: string }
> = {
  placeholder: {
    color: "#FAE1B7",
    displayName: "Placeholder",
  },
} as const;

export const Tag: React.FC<{ tag: NodeTag }> = ({ tag }) => (
  <Box
    // Temporarily hidden until we decide how this should appear in the graph
    // Please see https://github.com/theopensystemslab/planx-new/pull/3762
    style={visuallyHidden}
    sx={(theme) => ({
      bgcolor: TAG_DISPLAY_VALUES[tag].color,
      borderColor: theme.palette.common.black,
      borderWidth: "0 1px 1px 1px",
      borderStyle: "solid",
      width: "100%",
      p: 0.5,
      textAlign: "center",
      fontWeight: FONT_WEIGHT_SEMI_BOLD,
    })}
  >
    {TAG_DISPLAY_VALUES[tag].displayName}
  </Box>
);
