import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

export const WarningContainer = styled(Box)(({ theme }) => ({
  border: `solid 2px ${theme.palette.secondary.main}`,
  backgroundColor: theme.palette.background.paper,
  padding: theme.spacing(2),
  marginTop: theme.spacing(2),
  marginBottom: theme.spacing(2),
  display: "flex",
  flexDirection: "row",
  alignItems: "center",
}));
