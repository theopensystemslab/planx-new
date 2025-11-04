import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { Link } from "react-navi";
import { inputFocusStyle } from "theme";

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

export const DashboardLink = styled(Link)(() => ({
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  zIndex: 1,
  "&:focus": {
    ...inputFocusStyle,
  },
}));

export const LinkSubText = styled(Box)(({ theme }) => ({
  color: theme.palette.text.secondary,
  fontWeight: "normal",
  paddingTop: theme.spacing(0.75),
}));
