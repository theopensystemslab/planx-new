import Box from "@mui/material/Box";
import Chip from "@mui/material/Chip";
import { styled } from "@mui/material/styles";

export const StyledChip = styled(Chip)(({ theme }) => ({
  background: theme.palette.common.white,
  cursor: "default",
  textTransform: "capitalize",
  display: "flex",
  justifyContent: "space-between",
  borderRadius: "50px",
  "& > svg": {
    fill: theme.palette.text.secondary,
  },
  "&:hover": {
    background: theme.palette.common.white,
    "& > svg": {
      fill: theme.palette.text.primary,
    },
  },
}));

export const FiltersContent = styled(Box)(({ theme }) => ({
  width: "100%",
  margin: theme.spacing(1, 0, 3),
  padding: theme.spacing(1.5, 2),
  display: "flex",
  flexDirection: "row",
  flexWrap: "wrap",
  alignItems: "center",
  gap: theme.spacing(1),
  border: `1px solid ${theme.palette.border.main}`,
  background: theme.palette.secondary.dark,
}));
