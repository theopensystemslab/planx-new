import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React, { PropsWithChildren } from "react";

const Root = styled(Box)(() => ({
  color: "transparent",
  position: "absolute",
  height: "100%",
  width: "100%",
  top: 0,
  left: 0,
  display: "flex",
  "&::selection": {
    background: "pink",
    color: "black",
    padding: "1em",
  },
}));

export default function HiddenData(props: PropsWithChildren) {
  return <Root>{props.children}</Root>;
}
