import List from "@mui/material/List";
import { styled } from "@mui/material/styles";

export const Root = styled(List)(({ theme }) => ({
  color: theme.palette.text.primary,
  padding: theme.spacing(0.5, 0),
  backgroundColor: theme.palette.background.paper,
  border: `1px solid ${theme.palette.border.light}`,
}));
