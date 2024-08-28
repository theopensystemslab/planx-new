import { styled } from "@mui/material/styles";
import Tab, { tabClasses, TabProps } from "@mui/material/Tab";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

interface StyledTabProps extends TabProps {
  tabTheme?: "light" | "dark";
}

const StyledTab = styled(({ tabTheme, ...props }: StyledTabProps) => (
  <Tab {...props} disableFocusRipple disableTouchRipple disableRipple />
))<StyledTabProps>(({ theme, tabTheme }) => ({
  position: "relative",
  zIndex: 1,
  textTransform: "none",
  background: "transparent",
  border: `1px solid transparent`,
  borderBottomColor: theme.palette.border.main,
  color: theme.palette.primary.main,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  minHeight: "36px",
  margin: theme.spacing(0, 0.5),
  marginBottom: "-1px",
  padding: "0.5em",
  [`&.${tabClasses.selected}`]: {
    background:
      tabTheme === "dark"
        ? theme.palette.background.dark
        : theme.palette.background.default,
    borderColor: theme.palette.border.main,
    borderBottomColor: theme.palette.common.white,
    color:
      tabTheme === "dark"
        ? theme.palette.common.white
        : theme.palette.text.primary,
  },
}));

export default StyledTab;
