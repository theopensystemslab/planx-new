import { styled } from "@mui/material/styles";
import Tab, { tabClasses, TabProps } from "@mui/material/Tab";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

interface StyledTabProps extends TabProps {
  size?: "default" | "large";
}

const TabLabel = styled("span")(() => ({
  position: "relative",
  // Reserve space for bold text to prevent layout shift
  "&::after": {
    content: "attr(data-text)",
    display: "block",
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
    height: 0,
    visibility: "hidden",
    overflow: "hidden",
    pointerEvents: "none",
  },
}));

const StyledTab = styled(
  ({ size, label, ...props }: StyledTabProps) => (
    <Tab
      {...props}
      label={<TabLabel data-text={label}>{label}</TabLabel>}
      disableFocusRipple
      disableTouchRipple
      disableRipple
    />
  ),
  {
    shouldForwardProp: (prop) => prop !== "size",
  },
)<StyledTabProps>(({ theme, size = "default" }) => ({
  position: "relative",
  zIndex: 1,
  textTransform: "none",
  background: "transparent",
  borderBottomColor: theme.palette.border.main,
  color: theme.palette.text.primary,
  minWidth: 0,
  minHeight: size === "large" ? "48px" : "36px",
  margin: theme.spacing(0, size === "large" ? 1 : 0.5),
  padding: "0.75em",
  fontSize: size === "large" ? "1rem" : undefined,
  "& svg": {
    marginRight: "7px !important",
    fontSize: 18,
    opacity: 0.8,
  },
  [`&.${tabClasses.selected}`]: {
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
    color: theme.palette.text.primary,
    boxShadow: `inset 0 -3px 0 ${theme.palette.info.main}`,
  },
}));

export default StyledTab;
