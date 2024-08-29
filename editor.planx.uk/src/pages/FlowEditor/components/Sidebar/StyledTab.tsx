import { styled } from "@mui/material/styles";
import Tab, { tabClasses, TabProps } from "@mui/material/Tab";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

const StyledTab = styled((props: TabProps) => (
  <Tab {...props} disableFocusRipple disableTouchRipple disableRipple />
))<TabProps>(({ theme }) => ({
  position: "relative",
  zIndex: 1,
  textTransform: "none",
  background: "transparent",
  borderBottomColor: theme.palette.border.main,
  color: theme.palette.text.primary,
  minWidth: "75px",
  minHeight: "36px",
  margin: theme.spacing(0, 0.5),
  padding: "0.75em 0.25em",
  [`&.${tabClasses.selected}`]: {
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
    color: theme.palette.text.primary,
    boxShadow: `inset 0 -3px 0 ${theme.palette.background.dark}`,
  },
}));

export default StyledTab;
