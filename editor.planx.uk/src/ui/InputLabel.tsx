import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import React, { ReactNode } from "react";

const Root = styled("label")(() => ({
  display: "block",
  width: "100%",
}));

export default function InputLabel(props: {
  label: string;
  children: ReactNode;
  hidden?: boolean;
  htmlFor?: string;
}) {
  return (
    <Root htmlFor={props.htmlFor}>
      <Typography
        sx={{ pb: 1 }}
        variant="body1"
        style={props.hidden ? visuallyHidden : undefined}
      >
        {props.label}
      </Typography>
      {props.children}
    </Root>
  );
}
