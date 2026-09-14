import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Chip, { chipClasses } from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { cardBoxShadow, FONT_WEIGHT_SEMI_BOLD } from "theme";

export const MENU_WIDTH_COMPACT = 48;
export const MENU_WIDTH_FULL = 210;

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

export const NavBarContainer = styled(Box)(() => ({
  display: "flex",
  flexDirection: "column",
  height: "100vh",
  position: "sticky",
  width: "inherit",
  top: 0,
}));

export const NavScrollArea = styled(Box)(() => ({
  flex: 1,
  minHeight: 0,
  overflowY: "auto",
  display: "flex",
  flexDirection: "column",
}));

export const MenuWrap = styled("ul", {
  shouldForwardProp: (prop) => prop !== "compact",
})<{ compact?: boolean }>(({ theme, compact }) => ({
  listStyle: "none",
  margin: 0,
  padding: compact ? 0 : theme.spacing(1, 0.5, 2, 0.5),
}));

export const MenuItem = styled("li")(() => ({
  listStyle: "none",
  margin: 0,
}));

export const MenuTitle = styled(Typography)(({ theme }) => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  paddingTop: theme.spacing(0.1),
  textAlign: "left",
})) as typeof Typography;

export const MenuButton = styled(IconButton, {
  shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>(({ theme, isActive, disabled }) => ({
  position: "relative",
  color: theme.palette.text.primary,
  width: "100%",
  justifyContent: "flex-start",
  gap: theme.spacing(0.65),
  alignItems: "center",
  borderRadius: 0,
  padding: theme.spacing(1.25, 0.75),
  "&:hover": {
    background: theme.palette.background.disabled,
  },
  ...(isActive && {
    background: theme.palette.secondary.main,
    color: theme.palette.text.primary,
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      bottom: 0,
      right: 0,
      width: "4px",
      backgroundColor: theme.palette.grey[700],
    },
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

export const ExploreButton = styled(ButtonBase, {
  shouldForwardProp: (prop) => prop !== "isActive",
})<{ isActive: boolean }>(({ theme, isActive }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-start",
  gap: theme.spacing(0.65),
  width: "100%",
  color: theme.palette.text.primary,
  fontSize: "0.875rem",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  textAlign: "left",
  border: `1px solid ${theme.palette.border.main}`,
  borderRadius: theme.shape.borderRadiusSm,
  padding: theme.spacing(0.8, 1),
  background: theme.palette.background.default,
  "&:hover": {
    borderColor: theme.palette.border.input,
  },
  ...(isActive && {
    borderColor: theme.palette.border.input,
  }),
  "& > svg": {
    opacity: 0.75,
  },
}));

export const TeamCard = styled(Box)(({ theme }) => ({
  borderRadius: theme.shape.borderRadius,
  boxShadow: cardBoxShadow,
  overflow: "hidden",
  backgroundColor: theme.palette.common.white,
}));

export const TeamSectionGroup = styled(Box, {
  shouldForwardProp: (prop) => prop !== "teamColour",
})<{ teamColour?: string }>(({ theme, teamColour }) => ({
  borderLeft: `6px solid ${teamColour || theme.palette.primary.main}`,
  overflow: "hidden",
}));

export const AccordionContent = styled("ul")(({ theme }) => ({
  listStyle: "none",
  margin: theme.spacing(0, 0, 1, 1.6),
  padding: 0,
  borderLeft: `2px solid ${theme.palette.border.main}`,
  paddingLeft: 0,
}));

export const Subtitle = styled(Typography)(({ theme }) => ({
  display: "block",
  color: theme.palette.text.secondary,
  padding: theme.spacing(1.5, 0.8, 0.5, 0.8),
  fontSize: "0.8rem",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

export const StyledChip = styled(Chip)(({ theme }) => ({
  height: "16px",
  fontSize: "0.625rem",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.15, 0.2, 0, 0),
  marginLeft: "auto",
  [`& .${chipClasses.label}`]: {
    padding: theme.spacing(0, 0.35),
  },
}));

export const BadgeChip = styled(Chip)(({ theme }) => ({
  height: "22px",
  fontSize: "0.75rem",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  borderRadius: theme.shape.borderRadius,
  margin: theme.spacing(0.15, 0, 0, 0),
  marginLeft: "auto",
  minWidth: "22px",
  [`& .${chipClasses.label}`]: {
    padding: theme.spacing(0, 0.5),
  },
  [`&.${chipClasses.colorDefault}`]: {
    backgroundColor: theme.palette.secondary.dark,
  },
}));
