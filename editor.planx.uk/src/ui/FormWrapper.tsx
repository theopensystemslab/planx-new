import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";

export interface Props {
  children: JSX.Element[] | JSX.Element;
}

const Root = styled(Box)(({ theme }) => ({
  width: theme.breakpoints.values.formWrap,
  maxWidth: "100%",
}));

function FormWrapper(props: Props) {
  return <Root>{props.children || null}</Root>;
}

export default FormWrapper;
