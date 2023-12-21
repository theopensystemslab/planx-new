import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";

export interface Props {
  children: JSX.Element[] | JSX.Element;
}

const Root = styled(Box)(() => ({
  width: "100%",
  maxWidth: "none",
}));

function FullWidthWrapper(props: Props) {
  return <Root>{props.children || null}</Root>;
}

export default FullWidthWrapper;
