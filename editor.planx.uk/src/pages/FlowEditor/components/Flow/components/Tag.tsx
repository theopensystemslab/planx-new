import Box from "@mui/material/Box";
import { NodeTag } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const TAG_DISPLAY_VALUES: Record<
  NodeTag,
  { color: string; displayName: string }
> = {
  placeholder: {
    color: "#FAE1B7",
    displayName: "Placeholder",
  },
  "to review": {
    color: "#E9EDC9",
    displayName: "To review",
  },
  "sensitive data": {
    color: "#F4978E",
    displayName: "Sensitive data",
  },
  analytics: {
    color: "#E9EDC9",
    displayName: "Analytics",
  },
  automation: {
    color: "#E9EDC9",
    displayName: "Automation",
  },
} as const;

export const Tag: React.FC<{ tag: NodeTag }> = ({ tag }) => {
  const showTags = useStore((state) => state.showTags);
  if (!showTags) return null;

  return (
    <Box
      sx={(theme) => ({
        bgcolor: TAG_DISPLAY_VALUES[tag].color,
        borderColor: theme.palette.common.black,
        borderWidth: "0 1px 1px 1px",
        borderStyle: "solid",
        width: "100%",
        p: 0.5,
        textAlign: "center",
        fontWeight: FONT_WEIGHT_SEMI_BOLD,
        color: getContrastTextColor(TAG_DISPLAY_VALUES[tag].color, "#FFF"),
      })}
    >
      {TAG_DISPLAY_VALUES[tag].displayName}
    </Box>
  );
};
