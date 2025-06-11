import Box from "@mui/material/Box";
import { Palette, useTheme } from "@mui/material/styles";
import { NodeTag, Role } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { getContrastTextColor } from "styleUtils";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const TAG_DISPLAY_VALUES: Record<
  NodeTag,
  { color: keyof Palette["nodeTag"]; displayName: string; editableBy?: Role[] }
> = {
  customisation: {
    color: "blocking",
    displayName: "Customisation",
    editableBy: ["platformAdmin"],
  },
  toReview: {
    color: "nonBlocking",
    displayName: "To review",
  },
  sensitiveData: {
    color: "information",
    displayName: "Sensitive data",
  },
  analytics: {
    color: "information",
    displayName: "Analytics",
  },
  automation: {
    color: "information",
    displayName: "Automation",
  },
} as const;

export const Tag: React.FC<{ tag: NodeTag }> = ({ tag }) => {
  const theme = useTheme();

  const showTags = useStore((state) => state.showTags);
  if (!showTags) return null;

  const tagBgColor = theme.palette.nodeTag[TAG_DISPLAY_VALUES[tag].color];

  return (
    <Box
      className="card-tag"
      sx={(theme) => ({
        bgcolor: tagBgColor,
        border: `1px solid rgba(0, 0, 0, 0.2)`,
        padding: "2px 8px",
        borderRadius: "50px",
        textAlign: "center",
        fontWeight: FONT_WEIGHT_SEMI_BOLD,
        fontSize: "12px",
        color: getContrastTextColor(tagBgColor, "#FFF"),
      })}
    >
      {TAG_DISPLAY_VALUES[tag].displayName}
    </Box>
  );
};
