import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

export const DesignPreview = styled(Box)(({ theme }) => ({
  border: `2px solid ${theme.palette.border.input}`,
  padding: theme.spacing(2),
  boxShadow: "4px 4px 0px rgba(150, 150, 150, 0.5)",
  display: "flex",
  justifyContent: "center",
}));
