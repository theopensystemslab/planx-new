import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import React, { ReactNode } from "react";

interface RootProps extends BoxProps {
  background?: boolean;
}

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "background",
})<RootProps>(({ background, theme }) => ({
  display: "block",
  width: "100%",
  padding: theme.spacing(2.5),
  "&:first-of-type": {
    paddingTop: 0,
  },
  "& > * + *": {
    ...contentFlowSpacing(theme),
  },
  ...(background && {
    background: theme.palette.common.white,
    marginTop: theme.spacing(2),
    border: `1px solid #e5e9f2`,
    filter: `drop-shadow(rgba(0, 0, 0, 0.1) 0px 1px 0px)`,
  }),
}));

export default function InputRow({
  children,
  background,
}: {
  children: ReactNode;
  background?: boolean;
}) {
  return <Root background={background}>{children}</Root>;
}
