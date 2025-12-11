import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const MENU_WIDTH_COMPACT = 51;
export const MENU_WIDTH_FULL = 180;

export const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "compact",
})<{ compact?: boolean }>(({ theme, compact }) => ({
  width: compact ? MENU_WIDTH_COMPACT : MENU_WIDTH_FULL,
  flexShrink: 0,
  background: theme.palette.background.paper,
  borderRight: `1px solid ${theme.palette.border.light}`,
  zIndex: theme.zIndex.appBar,
  "@media print": {
    display: "none",
  },
}));

export const MenuWrap = styled("ul")(({ theme }) => ({
  listStyle: "none",
  margin: 0,
  padding: theme.spacing(1, 0.5, 0, 0.5),
  position: "sticky",
  top: 0,
}));

export const MenuItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.4, 0),
  padding: 0,
}));

export const MenuTitle = styled(Typography)(({ theme }) => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  paddingTop: theme.spacing(0.1),
  textAlign: "left",
})) as typeof Typography;

export const MenuButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>(({ theme, isActive, disabled }) => ({
  color: theme.palette.text.primary,
  border: "1 solid transparent",
  width: "100%",
  justifyContent: "flex-start",
  gap: theme.spacing(0.65),
  alignItems: "flex-start",
  borderRadius: "3px",
  "&:hover": {
    background: theme.palette.common.white,
    boxShadow: "0 1px 1.5px 0 rgba(0, 0, 0, 0.2)",
  },
  ...(isActive && {
    background: theme.palette.common.white,
    color: theme.palette.text.primary,
    boxShadow: "0 1px 1.5px 0 rgba(0, 0, 0, 0.2)",
  }),
  ...(disabled && {
    color: theme.palette.text.disabled,
    "&:hover": {
      background: "none",
    },
  }),
  "& > svg": {
    opacity: 0.75,
  },
}));

export const Subtitle = styled(Typography)(({ theme }) => ({
  display: "block",
  color: theme.palette.text.secondary,
  padding: theme.spacing(1.5, 0.8, 0.5, 0.8),
  fontSize: "0.8rem",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));
