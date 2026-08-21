import IconButton from "@mui/material/IconButton";
import { styled } from "@mui/material/styles";

export const CloseButton = styled(IconButton)(({ theme }) => ({
  margin: "0 0 0 auto",
  padding: theme.spacing(1),
  color: theme.palette.grey[600],
}));
