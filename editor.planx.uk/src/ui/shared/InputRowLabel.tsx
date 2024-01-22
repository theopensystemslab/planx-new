import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { ReactNode } from "react";

const Label = styled(Typography)(({ theme }) => ({
  flexShrink: 1,
  flexGrow: 0,
  paddingRight: theme.spacing(2),
  alignSelf: "center",
  "&:not(:nth-child(1))": {
    paddingLeft: theme.spacing(2),
  },
})) as typeof Typography;

export default function InputRowLabel({ children }: { children: ReactNode }) {
  return (
    <Label variant="body2" component="label">
      {children}
    </Label>
  );
}
