import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const SectionList = styled("ul")(({ theme }) => ({
  padding: theme.spacing(1, 0),
  listStyle: "none",
  "& ul, & ol": {
    padding: "0 0 0 1em",
    "& p": {
      marginTop: "0.5em",
    },
    "&:last-of-type": {
      marginBottom: 0,
    },
  },
}));

export const SectionRowWrapper = styled("li", {
  shouldForwardProp: (prop) => prop !== "isClickable",
})<{ isClickable?: boolean }>(({ theme, isClickable }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  padding: theme.spacing(2, 0),
  borderBottom: `1px solid ${theme.palette.border.main}`,
  listStyle: "none",
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
  },
  ...(isClickable && {
    cursor: "pointer",
    "&:hover": {
      backgroundColor: theme.palette.background.paper,
      "& a": {
        textDecorationThickness: "3px",
      },
    },
  }),
}));

export const SectionContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "column",
  width: "100%",
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
  },
}));

export const SectionTitleText = styled(Typography)(({ theme }) => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  color: theme.palette.text.primary,
})) as typeof Typography;

export const SectionTitleLink = styled(Typography)(({ theme }) => ({
  color: theme.palette.primary.main,
  fontSize: theme.typography.body1.fontSize,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
})) as typeof Typography;

export const SectionDescription = styled(Box)(({ theme }) => ({
  margin: 0,
  paddingBottom: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(0.33, 1, 0, 0),
    flexBasis: `calc(100% - 220px)`,
    flexShrink: 1,
    paddingBottom: 0,
  },
}));

export const SectionHint = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(0.5),
  color: theme.palette.text.secondary,
  "& ul": {
    listStyleType: "disc",
  },
}));

export const SectionStatus = styled(Box)(({ theme }) => ({
  margin: 0,
  [theme.breakpoints.up("md")]: {
    display: "flex",
    flexBasis: "220px",
    flexShrink: 0,
    flexGrow: 1,
    justifyContent: "flex-end",
    alignItems: "flex-start",
  },
  "& > *": {
    width: "auto",
    pointerEvents: "none",
  },
}));
