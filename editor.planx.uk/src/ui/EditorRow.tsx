import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import React, { ReactNode } from "react";

const Root = styled(Box)(({ theme }) => ({
  display: "block",
  width: "100%",
  padding: theme.spacing(3, 0),
  "&:first-of-type": {
    paddingTop: 0,
  },
  "& + &": {
    borderTop: "1px solid",
    borderColor: theme.palette.border.main,
  },
  "& > * + *": {
    ...contentFlowSpacing(theme),
  },
}));

export default function InputRow({ children }: { children: ReactNode }) {
  return <Root>{children}</Root>;
}
