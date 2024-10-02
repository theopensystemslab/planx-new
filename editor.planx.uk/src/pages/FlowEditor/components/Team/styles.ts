import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import { styled } from "@mui/material/styles";
import TableRow from "@mui/material/TableRow";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export const StyledAvatar = styled(Avatar)(({ theme }) => ({
  background: theme.palette.background.dark,
  color: theme.palette.common.white,
  fontSize: "1em",
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  marginRight: theme.spacing(1),
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
  "&:nth-of-type(even)": {
    background: theme.palette.background.paper,
  },
}));

export const SettingsDialog = styled(Dialog)(({ theme }) => ({
  "& .MuiDialog-paper": {
    width: "100%",
    maxWidth: theme.breakpoints.values.md,
    borderRadius: 0,
    borderTop: `20px solid ${theme.palette.primary.main}`,
    background: theme.palette.background.paper,
    margin: theme.spacing(2),
  },
}));
