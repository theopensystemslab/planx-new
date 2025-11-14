import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import ErrorFallback from "components/Error/ErrorFallback";
import React, { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "background",
})<BoxProps & { background?: boolean }>(({ background, theme }) => ({
  display: "block",
  width: "100%",
  marginTop: theme.spacing(2),
  paddingBottom: theme.spacing(1),
  position: "relative",
  zIndex: 1,
  "&:first-of-type": {
    marginTop: 0,
  },
  // Ensure links break correctly in narrow container
  "& a": {
    overflowWrap: "break-word",
    wordBreak: "break-all",
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

export default function SettingsSection(
  props: { children: ReactNode; background?: boolean } & Partial<BoxProps>,
) {
  return (
    <Root {...props}>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        {props.children}
      </ErrorBoundary>
    </Root>
  );
}
