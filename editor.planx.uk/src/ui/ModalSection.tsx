import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React, { PropsWithChildren } from "react";

const Root = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(3),
  "& + .modalSection": {
    borderTop: "0.5px solid #bbb",
  },
}));

export default function ModalSection(props: PropsWithChildren) {
  return <Root className="modalSection">{props.children}</Root>;
}
