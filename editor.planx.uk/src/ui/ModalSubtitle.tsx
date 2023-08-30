import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";

interface Props {
  title: string;
}

const Root = styled(Box)(() => ({
  display: "flex",
  height: 50,
  alignItems: "center",
}));

const StyledTypography = styled(Typography)(() => ({
  fontWeight: FONT_WEIGHT_SEMI_BOLD,
  opacity: 0.75,
}));

export const ModalSubtitle: React.FC<Props> = ({ title }) => (
  <Root sx={{ display: "flex" }}>
    <StyledTypography variant="body2">{title}</StyledTypography>
  </Root>
);
