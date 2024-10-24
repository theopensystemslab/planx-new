import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";

export const Description = styled(Box)(({ theme }) => ({
  "& p": {
    margin: theme.spacing(1, 0),
  },
}));

export const CardHeaderWrapper = styled(Box)(({ theme }) => ({
  maxWidth: theme.breakpoints.values.formWrap,
  marginBottom: theme.spacing(1),
}));

export const TitleWrapper = styled(Box)(({ theme }) => ({
  width: theme.breakpoints.values.formWrap,
  maxWidth: "100%",
}));

export const HelpButton = styled(Button)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  marginTop: theme.spacing(1.5),
  fontSize: "inherit",
  "& > svg": {
    marginRight: theme.spacing(0.5),
  },
})) as typeof Button;

export const Image = styled("img")(() => ({
  maxWidth: "100%",
}));
