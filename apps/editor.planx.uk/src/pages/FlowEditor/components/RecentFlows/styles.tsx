import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";
import { Link } from "@tanstack/react-router";

const RECENT_ROW_HEIGHT = "26px";

export const RecentFlowsOverlay = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1.5),
  left: theme.spacing(1.5),
  zIndex: theme.zIndex.appBar,
  maxWidth: `calc(100% - ${theme.spacing(5)})`,
}));

export const RecentFlowContainer = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  alignItems: "stretch",
  backgroundColor: theme.palette.text.primary,
  borderRadius: theme.spacing(0.5),
  padding: theme.spacing(0.5, 0),
  maxWidth: "100%",
  "& svg": {
    color: theme.palette.secondary.dark,
  },
}));

export const RecentFlowList = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(0.25),
  minWidth: 0,
  paddingLeft: theme.spacing(0.25),
}));

export const RecentFlowItem = styled(Box)<{ indent?: number }>(
  ({ indent = 0, theme }) => ({
    display: "flex",
    alignItems: "center",
    whiteSpace: "nowrap",
    paddingLeft: indent > 0 ? theme.spacing(5.5 + indent) : theme.spacing(1),
    paddingRight: theme.spacing(1.5),
    color: theme.palette.common.white,
    height: RECENT_ROW_HEIGHT,
  }),
);

export const ToggleWrap = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
  minHeight: RECENT_ROW_HEIGHT,
}));

export const ToggleButton = styled(IconButton)(({ theme }) => ({
  color: theme.palette.common.white,
  padding: theme.spacing(0.1, 1),
  borderLeft: `1px solid ${theme.palette.border.main}`,
  alignSelf: "stretch",
  alignItems: "flex-start",
}));

export const ExpandableContent = styled(Box, {
  shouldForwardProp: (prop) => prop !== "isExpanded",
})<{ isExpanded: boolean }>(({ isExpanded }) => ({
  display: "grid",
  gridTemplateRows: isExpanded ? "1fr" : "0fr",
  gridTemplateColumns: isExpanded ? "1fr" : "0fr",
  transition:
    "grid-template-rows 200ms ease-in-out, grid-template-columns 300ms ease-in-out",
  "& > div": {
    overflow: "hidden",
    minWidth: 0,
    minHeight: 0,
  },
}));

export const RecentFlowLinkRoot = styled(Link)(({ theme }) => ({
  color: theme.palette.secondary.dark,
  display: "flex",
  alignItems: "center",
  flexWrap: "nowrap",
  gap: theme.spacing(0.25),
  textDecoration: "none",
  "& .flow-name": {
    textDecoration: "underline",
    color: theme.palette.common.white,
  },
  "&:hover .flow-name": {
    textDecorationThickness: "2px",
  },
}));
