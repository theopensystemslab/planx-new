import BuildIcon from "@mui/icons-material/Build";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

interface Props {
  title: string;
}

const Root = styled(Box)(({ theme }) => ({
  display: "flex",
  height: 50,
  alignItems: "center",
  background: "white",
  padding: theme.spacing(4, 3),
  border: "3px dashed black",
  borderRadius: "200px",
  justifyContent: "center",
}));

const TitleWrap = styled(Box)(() => ({
  display: "flex",
  alignItems: "center",
}));

export const FeaturePlaceholder: React.FC<Props> = ({ title }) => (
  <Root>
    <TitleWrap>
      <BuildIcon sx={{ marginRight: "0.25em" }} />
      <Typography variant="h4">{title}</Typography>
    </TitleWrap>
  </Root>
);
