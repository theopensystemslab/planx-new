import ImageIcon from "@mui/icons-material/Image";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";

const Root = styled(Box)({
  alignItems: "center",
  backgroundColor: "white",
  display: "flex",
  height: "100%",
  justifyContent: "center",
  left: 0,
  objectFit: "contain",
  position: "absolute",
  top: 0,
  width: "100%",
});

export const FallbackImage: React.FC = () => (
  <Root>
    <ImageIcon />
  </Root>
);
