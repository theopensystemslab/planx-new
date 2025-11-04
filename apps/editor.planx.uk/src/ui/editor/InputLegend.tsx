import { styled } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";
import React, { PropsWithChildren } from "react";

const Legend = styled(Typography)(() => ({
  display: "block",
  width: "100%",
  padding: 0,
})) as typeof Typography;

export default function InputLegend({
  children,
  ...props
}: PropsWithChildren<TypographyProps>) {
  return (
    <Legend variant="h3" component="legend" {...props}>
      {children}
    </Legend>
  );
}
