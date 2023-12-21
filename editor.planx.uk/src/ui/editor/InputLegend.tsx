import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { ReactNode } from "react";

const Legend = styled(Typography)(() => ({
  display: "block",
  width: "100%",
})) as typeof Typography;

export default function InputLegend({ children }: { children: ReactNode }) {
  return (
    <Legend variant="h3" component="legend">
      {children}
    </Legend>
  );
}
