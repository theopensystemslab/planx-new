import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { Link } from "react-navi";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const StyledTable = styled(Table)(({ theme }) => ({
  marginTop: theme.spacing(2),
  zIndex: 1,
  position: "relative",
  border: `1px solid ${theme.palette.border.main}`,
  borderBottom: 0,
  borderCollapse: "separate",
  [`& .${tableCellClasses.root}`]: {
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },
}));

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
  [`& .${tableCellClasses.root}`]: {
    backgroundColor: theme.palette.background.default,
    borderBottom: `1px solid ${theme.palette.border.main}`,
    position: "sticky",
    top: 0,
    zIndex: 2,
    "&:last-of-type": {
      borderLeft: `1px solid ${theme.palette.border.main}`,
    },
  },
}));

export const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) => prop !== "isTemplated",
})<{ isTemplated?: boolean }>(({ theme, isTemplated }) => ({
  backgroundColor: isTemplated
    ? theme.palette.template.light
    : theme.palette.background.default,
  cursor: "pointer",
  "&:hover": {
    backgroundColor: isTemplated
      ? theme.palette.template.main
      : theme.palette.background.paper,
    "& a": {
      textDecoration: "underline",
    },
  },
  "& .actions-cell": {
    cursor: "default",
    position: "relative",
    // Min-height to compensate for padding
    height: "80px",
    // Make the entire cell clickable area for the menu button
    "& > div, & button": {
      position: "absolute",
      left: 0,
      top: 0,
      width: "100%",
      height: "100%",
    },
  },
  "&:has(.actions-cell:hover) a": {
    textDecoration: "none",
  },
}));

export const FlowTitleCell = styled(TableCell)(() => ({
  width: "45%",
  minWidth: "240px",
}));

export const FlowStatusCell = styled(TableCell)(() => ({
  width: "11%",
  minWidth: "150px",
}));

export const FlowActionsCell = styled(TableCell)(({ theme }) => ({
  width: "5%",
  maxWidth: "100px",
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1px solid ${theme.palette.border.main}`,
}));

export const FlowLink = styled(Link)(({ theme }) => ({
  textDecoration: "none",
  color: theme.palette.text.primary,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  "&:hover": {
    textDecoration: "underline",
  },
}));
