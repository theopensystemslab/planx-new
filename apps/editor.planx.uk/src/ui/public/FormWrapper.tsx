import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";

export interface Props {
  children: JSX.Element[] | JSX.Element;
  variant?: "default" | "fullWidth";
}

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant?: "default" | "fullWidth" }>(({ theme, variant }) => ({
  width: variant === "fullWidth" ? "100%" : theme.breakpoints.values.formWrap,
  maxWidth: "100%",
}));

function FormWrapper({ children, variant = "default" }: Props) {
  return <Root variant={variant}>{children || null}</Root>;
}

export default FormWrapper;
