import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { type FC } from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

const Root = styled(Box)(({ theme }) => ({
  borderLeft: `5px solid ${theme.palette.error.main}`,
  padding: theme.spacing(1),
}));

export const InlineError: FC<{ id: string; error: string }> = ({ id, error }) => {
  return (
    <Root id={id}>
      <Typography variant="body1" color="error" fontWeight={FONT_WEIGHT_SEMI_BOLD}>{error}</Typography>
    </Root>
  );
};
