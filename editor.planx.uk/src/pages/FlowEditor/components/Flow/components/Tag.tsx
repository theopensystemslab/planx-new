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
  placeholder: {
    color: "blocking",
    displayName: "Placeholder",
    editableBy: ["platformAdmin"], // if new roles are added, we should update the canEdit() in ComponentTagSelect.tsx
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
      sx={(theme) => ({
        bgcolor: tagBgColor,
        borderColor: theme.palette.common.black,
        borderWidth: "0 1px 1px 1px",
        borderStyle: "solid",
        width: "100%",
        p: 0.5,
        textAlign: "center",
        fontWeight: FONT_WEIGHT_SEMI_BOLD,
        color: getContrastTextColor(tagBgColor, "#FFF"),
      })}
    >
      {TAG_DISPLAY_VALUES[tag].displayName}
    </Box>
  );
};
