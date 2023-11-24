import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { ReactNode } from "react";

const Caption = styled(Typography)(({ theme }) => ({
  width: "100%",
  textAlign: "left",
  color: theme.palette.text.secondary,
})) as typeof Typography;

export default function InputCaption({ children }: { children: ReactNode }) {
  return (
    <Caption variant="body2" component="caption">
      {children}
    </Caption>
  );
}
