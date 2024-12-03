import { styled } from "@mui/material/styles";
import { tableCellClasses } from "@mui/material/TableCell";
import TableRow from "@mui/material/TableRow";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const BoldTableRow = styled(TableRow)(() => ({
  [`& .${tableCellClasses.root}`]: {
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
  },
}));