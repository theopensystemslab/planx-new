import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

interface Props {
  title: string;
}

const Root = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

const StyledTypography = styled(Typography)(({ theme }) => ({
  padding: theme.spacing(1.15, 0, 0.75),
}));

export const ModalSubtitle: React.FC<Props> = ({ title }) => (
  <Root sx={{ display: "flex" }}>
    <StyledTypography variant="subtitle2">{title}</StyledTypography>
  </Root>
);
