import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

export const ErrorSummaryContainer = styled(Box)(({ theme }) => ({
  marginTop: theme.spacing(1),
  padding: theme.spacing(3),
  border: `5px solid ${theme.palette.error.main}`,
  "& button": {
    background: "none",
    borderStyle: "none",
    color: theme.palette.error.main,
    cursor: "pointer",
    fontSize: "medium",
    fontWeight: 700,
    textDecoration: "underline",
    marginTop: theme.spacing(2),
    padding: theme.spacing(0),
  },
  "& button:hover": {
    backgroundColor: theme.palette.background.paper,
  },
}));
