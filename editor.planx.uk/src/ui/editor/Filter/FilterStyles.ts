import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { styled } from "@mui/material/styles";
import { focusStyle } from "theme";

export const StyledChip = styled(Chip)(({ theme }) => ({
  background: theme.palette.background.dark,
  color: theme.palette.common.white,
  cursor: "default",
  textTransform: "capitalize",
  fontSize: theme.typography.body3.fontSize,
  display: "flex",
  flexDirection: "row-reverse",
  justifyContent: "space-between",
  borderRadius: "50px",
  height: "36px",
  "& > span": {
    paddingRight: 0,
  },
  "& > svg": {
    marginRight: "6px !important",
    fill: theme.palette.secondary.dark,
  },
  "&:focus": {
    ...focusStyle,
    "& > svg": {
      fill: theme.palette.background.dark,
    },
  },
  "&:hover": {
    background: theme.palette.background.dark,
    cursor: "pointer",
  },
  "&:hover > svg": {
    fill: theme.palette.common.white,
  },
}));

export const FiltersContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing(1),
  flexShrink: 0,
}));
