import AutoFixHighIcon from "@mui/icons-material/AutoFixHigh";
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
    color: "automation",
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
      className={`card-tag ${tag}`}
      sx={{
        bgcolor: tagBgColor,
        border: `1px solid rgba(0, 0, 0, 0.2)`,
        padding: "4px 12px",
        borderRadius: "50px",
        textAlign: "center",
        fontSize: "12px",
        fontWeight: FONT_WEIGHT_SEMI_BOLD,
        color: getContrastTextColor(tagBgColor, "#FFF"),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "4px",
      }}
    >
      {tag === "automation" && (
        <AutoFixHighIcon sx={{ fontSize: "13px", color: "inherit" }} />
      )}
      {TAG_DISPLAY_VALUES[tag].displayName}
    </Box>
  );
};
