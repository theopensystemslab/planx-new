import { styled } from "@mui/material/styles";
import type { TypographyProps } from "@mui/material/Typography";
import Typography from "@mui/material/Typography";
import type { PropsWithChildren } from "react";
import React from "react";

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
