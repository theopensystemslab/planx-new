import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

export const AddressLoadingWrap = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(-2.5),
  minHeight: theme.spacing(3),
  pointerEvents: "none",
  [theme.breakpoints.up("md")]: {
    position: "relative",
    margin: 0,
    height: 0,
    minHeight: 0,
    "& > div": {
      position: "absolute",
      top: theme.spacing(5.5),
      justifyContent: "flex-start",
      paddingLeft: theme.spacing(16),
    },
  },
}));
