import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { contentFlowSpacing } from "@planx/components/shared/Preview/Card";
import ErrorFallback from "components/Error/ErrorFallback";
import React, { ReactNode } from "react";
import { ErrorBoundary } from "react-error-boundary";

const Root = styled(Box)(({ theme }) => ({
  display: "block",
  width: "100%",
  padding: theme.spacing(6, 0),
  position: "relative",
  overflow: "hidden",
  background: theme.palette.background.paper,
  borderTop: `1px solid ${theme.palette.border.main}`,
  "&:first-of-type": {
    paddingTop: 0,
    borderTop: 0,
  },
  // Ensure links break correctly in narrow container
  "& a": {
    overflowWrap: "break-word",
    wordWrap: "break-word",
  },
  "& > * + *, & > form > * + *": {
    ...contentFlowSpacing(theme),
  },
}));

export default function NewSettingsSection(
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
