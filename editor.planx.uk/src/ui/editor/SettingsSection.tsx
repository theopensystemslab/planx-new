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
  marginTop: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  "&:first-of-type": {
    marginTop: 0,
  },
  "& > * + *, & > form > * + *": {
    ...contentFlowSpacing(theme),
  },
  ...(background && {
    background: theme.palette.background.paper,
    marginTop: theme.spacing(2),
    padding: theme.spacing(2.5),
    border: `1px solid ${theme.palette.border.light}`,
  }),
}));

export default function SettingsSection({
  children,
  background,
}: {
  children: ReactNode;
  background?: boolean;
}) {
  return <Root background={background}>{children}</Root>;
}
