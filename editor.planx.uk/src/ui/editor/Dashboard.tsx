import Box from "@mui/material/Box";
import { containerClasses } from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import { HEADER_HEIGHT } from "components/Header";
import React, { PropsWithChildren } from "react";

const DashboardWrap = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  width: "100%",
  display: "flex",
  alignItems: "flex-start",
  flexGrow: 1,
}));

const DashboardContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  display: "flex",
  flexDirection: "row",
  width: "100%",
  minHeight: `calc(100vh - ${HEADER_HEIGHT}px)`,
  [`& > .${containerClasses.root}`]: {
    paddingTop: theme.spacing(5),
    paddingBottom: theme.spacing(5),
  },
}));

export default function Dashboard(props: PropsWithChildren) {
  return (
    <DashboardWrap>
      <DashboardContainer>{props.children}</DashboardContainer>
    </DashboardWrap>
  );
}
