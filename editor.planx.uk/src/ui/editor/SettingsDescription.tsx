import { styled } from "@mui/material/styles";
import Typography, { TypographyProps } from "@mui/material/Typography";
import React, { PropsWithChildren } from "react";

const Description = styled(Typography)(({ theme }) => ({
  width: "100%",
  textAlign: "left",
  color: theme.palette.text.secondary,
  "& p, & a": {
    fontSize: "inherit",
    margin: 0,
  },
  "& p + p": {
    marginTop: "1em",
  },
})) as typeof Typography;

export default function SettingsDescription({
  children,
  ...props
}: PropsWithChildren<TypographyProps>) {
  return (
    <Description component="div" variant="body2" {...props}>
      {children}
    </Description>
  );
}
