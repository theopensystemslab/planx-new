import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React, { ReactNode } from "react";

const Section = styled(Box)(({ theme }) => ({
  paddingBottom: theme.spacing(3),
  "& + .modalSection": {
    borderTop: "0.5px solid #bbb",
  },
}));

export default function ModalSection({
  children,
}: {
  children: ReactNode;
}): FCReturn {
  return <Section className="modalSection">{children}</Section>;
}
