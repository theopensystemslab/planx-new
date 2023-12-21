import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React, { PropsWithChildren } from "react";

const Root = styled(Box)(({ theme }) => ({
  padding: theme.spacing(2, 0),
  "& + .modalSection": {
    borderTop: `1px solid ${theme.palette.border.main}`,
  },
}));

export default function ModalSection(props: PropsWithChildren) {
  return <Root className="modalSection">{props.children}</Root>;
}
