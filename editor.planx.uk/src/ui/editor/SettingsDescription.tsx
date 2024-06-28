import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { ReactNode } from "react";

const Description = styled(Typography)(({ theme }) => ({
  width: "100%",
  textAlign: "left",
  color: theme.palette.text.secondary,
  paddingBottom: theme.spacing(1),
  paddingTop: theme.spacing(0.5),
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
}: {
  children: ReactNode;
}) {
  return (
    <Description component="div" variant="body2">
      {children}
    </Description>
  );
}
