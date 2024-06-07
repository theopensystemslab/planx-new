import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

interface Props {
  heading?: string;
  message?: string;
  format?: "error" | "warning" | "info";
}

const Root = styled(Box, {
  shouldForwardProp: (prop) => !["format"].includes(prop.toString()),
})<Props>(({ theme, format }) => ({
  padding: theme.spacing(3),
  border: `5px solid ${theme.palette.error.main}`,
  ...(format === "warning" && {
    borderColor: theme.palette.warning.main,
  }),
  ...(format === "info" && {
    borderColor: theme.palette.border.light,
  }),
}));

function ErrorSummary(props: Props) {
  return (
    <Root role="status" data-testid="error-summary" {...props}>
      <Typography variant="h4" gutterBottom>
        {props.heading}
      </Typography>
      <Typography variant="body2">{props.message}</Typography>
    </Root>
  );
}

export default ErrorSummary;
