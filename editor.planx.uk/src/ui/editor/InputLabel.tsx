import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import React, { PropsWithChildren } from "react";

const Root = styled("label")(() => ({
  display: "block",
  width: "100%",
}));

export default function InputLabel(
  props: PropsWithChildren<{
    label: string;
    hidden?: boolean;
    htmlFor?: string;
    id?: string;
  }>,
) {
  return (
    <Root htmlFor={props.htmlFor} id={props.id}>
      <Typography
        sx={{ pb: 0.5 }}
        variant="body2"
        style={props.hidden ? visuallyHidden : undefined}
      >
        {props.label}
      </Typography>
      {props.children}
    </Root>
  );
}
