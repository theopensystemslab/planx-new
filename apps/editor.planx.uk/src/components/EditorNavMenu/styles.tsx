import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const MENU_WIDTH_COMPACT = 51;
export const MENU_WIDTH_FULL = 164;

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
  padding: theme.spacing(1, 0.4, 0, 0.4),
  position: "sticky",
  top: 0,
}));

export const MenuItem = styled("li")(({ theme }) => ({
  margin: theme.spacing(0.75, 0),
  padding: 0,
}));

export const MenuTitle = styled(Typography)(({ theme }) => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  paddingLeft: theme.spacing(0.5),
  paddingTop: theme.spacing(0.1),
  textAlign: "left",
})) as typeof Typography;

export const MenuButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>(({ theme, isActive, disabled }) => ({
  color: theme.palette.text.primary,
  width: "100%",
  border: "1px solid transparent",
  justifyContent: "flex-start",
  alignItems: "flex-start",
  borderRadius: "3px",
  "&:hover": {
    background: theme.palette.common.white,
    borderColor: theme.palette.border.light,
  },
  ...(isActive && {
    background: theme.palette.common.white,
    color: theme.palette.text.primary,
    border: `1px solid ${theme.palette.border.main}`,
    "&:hover": {
      borderColor: theme.palette.border.main,
    },
  }),
  ...(disabled && {
    color: theme.palette.text.disabled,
    "&:hover": {
      background: "none",
      borderColor: "transparent",
    },
  }),
  "& > svg": {
    opacity: 0.8,
  },
}));
