import { styled } from "@mui/material/styles";
import Table from "@mui/material/Table";
import TableCell, { tableCellClasses } from "@mui/material/TableCell";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { inputFocusStyle } from "theme";

export const SpacerTableRow = styled(TableRow)(({ theme }) => ({
  height: theme.spacing(3),
  backgroundColor: `${theme.palette.background.paper} !important`,
  pointerEvents: "none",
  [`& .${tableCellClasses.root}`]: {
    padding: "0 !important",
    borderBottom: `1px solid ${theme.palette.border.main} !important`,
  },
}));

import { CustomLink } from "../../../../ui/shared/CustomLink/CustomLink";

export const StyledTable = styled(Table)(({ theme }) => ({
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  zIndex: 1,
  position: "relative",
  borderCollapse: "separate",
  borderSpacing: 0,
  [`& .${tableCellClasses.root}`]: {
    padding: theme.spacing(1.5, 2),
    borderBottom: `1px solid ${theme.palette.border.main}`,
  },
}));

export const StyledTableHead = styled(TableHead)(({ theme }) => ({
  [`& .${tableCellClasses.root}`]: {
    backgroundColor: theme.palette.background.default,
    borderTop: `1px solid ${theme.palette.border.main}`,
    borderBottom: `1px solid ${theme.palette.border.main}`,
    position: "sticky",
    top: 0,
    zIndex: theme.zIndex.appBar,
    "&:first-of-type": {
      borderLeft: `1px solid ${theme.palette.border.main}`,
    },
    "&:last-of-type": {
      borderLeft: `1px solid ${theme.palette.border.main}`,
      borderRight: `1px solid ${theme.palette.border.main}`,
    },
  },
}));

export const StyledTableRow = styled(TableRow, {
  shouldForwardProp: (prop) => prop !== "isTemplated" && prop !== "clickable",
})<{ isTemplated?: boolean; clickable?: boolean }>(({
  theme,
  isTemplated,
  clickable = true,
}) => {
  let hoverBackground: string | undefined;
  if (clickable && isTemplated) {
    hoverBackground = theme.palette.template.main;
  } else if (clickable) {
    hoverBackground = theme.palette.background.paper;
  }

  return {
    position: "relative",
    backgroundColor: isTemplated
      ? theme.palette.template.light
      : theme.palette.background.default,
    "&:hover": {
      backgroundColor: hoverBackground,
    },
    "& > td:first-of-type": {
      borderLeft: `1px solid ${theme.palette.border.main}`,
    },
    "& > td:last-of-type": {
      borderRight: `1px solid ${theme.palette.border.main}`,
    },
    "& .actions-cell": {
      cursor: "default",
      position: "relative",
      zIndex: 2,
      height: "80px",
      "& > div, & button": {
        position: "absolute",
        left: 0,
        top: 0,
        width: "100%",
        height: "100%",
      },
    },
  };
});

export const FlowRowLink = styled(CustomLink)(() => ({
  position: "absolute",
  left: 0,
  top: 0,
  width: "100%",
  height: "100%",
  zIndex: 1,
  "&:focus": {
    ...inputFocusStyle,
  },
  "&:focus-visible": {
    backgroundColor: "transparent",
  },
})) as typeof CustomLink;

export const FlowTitleCell = styled(TableCell)(() => ({
  width: "100%",
  minWidth: "240px",
}));

export const FlowStatusCell = styled(TableCell)(() => ({
  width: "11%",
  minWidth: "150px",
}));

export const FlowDateCell = styled(TableCell)(() => ({
  width: "20%",
  minWidth: "240px",
}));

export const FlowActionsCell = styled(TableCell)(({ theme }) => ({
  width: "5%",
  maxWidth: "100px",
  backgroundColor: theme.palette.background.paper,
  borderLeft: `1px solid ${theme.palette.border.main}`,
}));
