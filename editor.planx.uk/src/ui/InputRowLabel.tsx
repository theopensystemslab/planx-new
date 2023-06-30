import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React, { ReactNode } from "react";

const Root = styled(Box)(({ theme }) => ({
  flexShrink: 1,
  flexGrow: 0,
  paddingRight: theme.spacing(2),
  alignSelf: "center",
  "&:not(:first-child)": {
    paddingLeft: theme.spacing(2),
  },
}));

export default function InputRowLabel({ children }: { children: ReactNode }) {
  return <Root>{children}</Root>;
}
