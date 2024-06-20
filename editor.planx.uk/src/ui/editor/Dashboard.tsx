import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { HEADER_HEIGHT } from "components/Header";
import React, { PropsWithChildren } from "react";

const Root = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  display: "flex",
  flexDirection: "row",
  width: "100%",
  minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
  "& > .MuiContainer-root": {
    paddingTop: theme.spacing(6),
    paddingBottom: theme.spacing(6),
  },
}));

export default function Dashboard(props: PropsWithChildren) {
  return <Root>{props.children}</Root>;
}
