import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ERROR_MESSAGE } from "@planx/components/shared/constants";
import React, { ReactElement } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

export interface Props {
  error: string | string[] | undefined;
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

export default function ErrorWrapper(props: Props): FCReturn {
  const id = props.id ? `${ERROR_MESSAGE}-${props.id}` : undefined;

  return (
    // role="status" immediately announces the error to screenreaders without interrupting focus
    <Root error={props.error} role="status" data-testid="error-wrapper">
      <ErrorText id={id} data-testid={id} variant="body1">
        {props?.error}
      </ErrorText>
      {props.children || null}
    </Root>
  );
}
