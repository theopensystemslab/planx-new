import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { styled } from "@mui/material/styles";

export const StyledChip = styled(Chip)(({ theme }) => ({
  background: theme.palette.background.dark,
  color: theme.palette.common.white,
  cursor: "default",
  textTransform: "capitalize",
  display: "flex",
  justifyContent: "space-between",
  borderRadius: "50px",
  height: "36px",
  "& > svg": {
    fill: theme.palette.secondary.dark,
    "&:hover": {
      fill: theme.palette.common.white,
    },
  },
}));

export const FiltersContent = styled(Box)(({ theme }) => ({
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
  gap: theme.spacing(1),
  flexShrink: 0,
}));
