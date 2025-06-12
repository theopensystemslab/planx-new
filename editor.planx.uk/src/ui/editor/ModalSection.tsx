import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React, { PropsWithChildren } from "react";

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "sectionBackgroundColor",
})<{ sectionBackgroundColor?: string }>(
  ({ theme, sectionBackgroundColor }) => ({
    backgroundColor: sectionBackgroundColor
      ? sectionBackgroundColor
      : undefined,
    padding: theme.spacing(2, 0),
    "& + .modalSection": {
      borderTop: `1px solid ${theme.palette.border.main}`,
    },
  }),
);

export default function ModalSection(
  props: PropsWithChildren & { sectionBackgroundColor?: string },
) {
  return (
    <Root
      className="modalSection"
      sx={{
        backgroundColor: props.sectionBackgroundColor
          ? props.sectionBackgroundColor
          : undefined,
      }}
    >
      {props.children}
    </Root>
  );
}
