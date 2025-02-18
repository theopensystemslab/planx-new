import { InputLabelProps } from "@mui/material/InputLabel";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { ReactNode } from "react";

const Label = styled(Typography)(({ theme }) => ({
  flexShrink: 1,
  flexGrow: 0,
  paddingRight: theme.spacing(2),
  alignSelf: "center",
})) as typeof Typography;

export default function InputRowLabel({ children, inputProps }: { children: ReactNode, inputProps?:InputLabelProps }) {
  return (
    <Label {...inputProps} variant="body2" component="label" >
      {children}
    </Label>
  );
}
