import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

export const Dot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "size",
})<{ size?: number }>(({ size = 12 }) => ({
  width: size,
  height: size,
  borderRadius: "50%",
  flexShrink: 0,
}));
