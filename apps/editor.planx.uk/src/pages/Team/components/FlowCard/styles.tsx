import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { inputFocusStyle } from "theme";

import SimpleMenu from "../../../../ui/editor/SimpleMenu";
import { CustomLink } from "../../../../ui/shared/CustomLink/CustomLink";

export const Card = styled("li")(({ theme }) => ({
  listStyle: "none",
  position: "relative",
  display: "flex",
  flexDirection: "column",
  justifyContent: "stretch",
  borderRadius: "3px",
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.border.light}`,
  boxShadow: "0 2px 6px 1px rgba(0, 0, 0, 0.1)",
}));

export const CardBanner = styled(Box)(({ theme }) => ({
  width: "100%",
  background: theme.palette.template.main,
  padding: theme.spacing(0.5, 2),
  borderBottom: `1px solid ${theme.palette.border.main}`,
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(0.4),
}));

export const CardContent = styled(Box)(({ theme }) => ({
  height: "100%",
  textDecoration: "none",
  color: "currentColor",
  padding: theme.spacing(2, 2, 1.5),
  display: "flex",
  flexDirection: "column",
  alignItems: "flex-start",
  gap: theme.spacing(1.5),
  margin: 0,
  width: "100%",
}));

export const DashboardLink = styled(CustomLink)(() => ({
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  zIndex: 1,
  "&:focus": {
    ...inputFocusStyle,
  },
})) as typeof CustomLink;

export const LinkSubText = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: "normal",
  paddingTop: theme.spacing(0.75),
}));

export const StyledSimpleMenu = styled(SimpleMenu)(({ theme }) => ({
  display: "flex",
  marginTop: "auto",
  borderTop: `1px solid ${theme.palette.border.light}`,
  backgroundColor: theme.palette.background.paper,
  overflow: "hidden",
  borderRadius: "0px 0px 4px 4px",
  maxHeight: "35px",
  "& > button": {
    padding: theme.spacing(0.25, 1),
    width: "100%",
    justifyContent: "flex-start",
    "& > svg": {
      display: "none",
    },
  },
}));
