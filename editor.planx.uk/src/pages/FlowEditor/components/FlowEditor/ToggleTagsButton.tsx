import LabelIcon from "@mui/icons-material/Label";
import LabelOffIcon from "@mui/icons-material/LabelOff";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Tooltip, { tooltipClasses, TooltipProps } from "@mui/material/Tooltip";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const TooltipWrap = styled(({ className, ...props }: TooltipProps) => (
  <Tooltip {...props} arrow placement="right" classes={{ popper: className }} />
))(() => ({
  [`& .${tooltipClasses.arrow}`]: {
    color: "#2c2c2c",
  },
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: "#2c2c2c",
    left: "-5px",
    fontSize: "0.8em",
    borderRadius: 0,
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
  },
}));

export const ToggleTagsButton: React.FC = () => {
  const [showTags, toggleShowTags] = useStore((state) => [
    state.showTags,
    state.toggleShowTags,
  ]);

  return (
    <Box
      sx={(theme) => ({
        position: "fixed",
        bottom: theme.spacing(2),
        left: theme.spacing(7),
        zIndex: theme.zIndex.appBar,
        border: `1px solid ${theme.palette.border.main}`,
        borderRadius: "3px",
        background: theme.palette.background.paper,
      })}
    >
      <TooltipWrap title="Toggle tags">
        <IconButton
          aria-label="Toggle tags"
          onClick={toggleShowTags}
          size="large"
          sx={(theme) => ({
            padding: theme.spacing(1),
            color: showTags
              ? theme.palette.text.primary
              : theme.palette.text.disabled,
          })}
        >
          {showTags ? <LabelIcon /> : <LabelOffIcon />}
        </IconButton>
      </TooltipWrap>
    </Box>
  );
};
