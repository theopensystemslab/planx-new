import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ERROR_MESSAGE } from "@planx/components/shared/constants";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import React, { ReactElement, useEffect } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "ui/editor/theme";

export interface Props {
  error?: string;
  children?: ReactElement;
  id?: string;
}

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "error",
})<BoxProps & { error: Props["error"] }>(({ theme, error }) => ({
  ...(error && {
    width: "100%",
    paddingLeft: theme.spacing(1.5),
    borderLeft: `5px solid ${theme.palette.error.main}`,
    display: "flex",
    flexDirection: "column",
    // Only apply padding to child when visible to ensure no blank space
    "& > p": {
      paddingTop: theme.spacing(0.5),
      paddingBottom: theme.spacing(1),
    },
  }),
}));

const ErrorText = styled(Typography)(({ theme }) => ({
  color: theme.palette.error.main,
  margin: 0,
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
}));

export default function ErrorWrapper({ id, error, children }: Props): FCReturn {
  const inputId = id ? `${ERROR_MESSAGE}-${id}` : undefined;
  const { trackInputErrors } = useAnalyticsTracking();

  useEffect(() => {
    error && trackInputErrors(error);
  }, [error, trackInputErrors]);

  return (
    // role="status" immediately announces the error to screenreaders without interrupting focus
    <Root error={error} role="status" data-testid="error-wrapper">
      <ErrorText id={inputId} data-testid={inputId} variant="body1">
        {error && error}
      </ErrorText>
      {children || null}
    </Root>
  );
}
