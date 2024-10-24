import Box from "@mui/material/Box";
import { containerClasses } from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import EditorNavMenu from "components/EditorNavMenu";
import RouteLoadingIndicator from "components/RouteLoadingIndicator";
import React, { PropsWithChildren } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import Header from "../../components/Header";

const DashboardWrap = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  width: "100%",
  display: "flex",
  flexGrow: 1,
}));

const DashboardContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  display: "flex",
  flexDirection: "row",
  width: "100%",
  overflow: "hidden",
  [`& > .${containerClasses.root}`]: {
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    [theme.breakpoints.up("lg")]: {
      paddingTop: theme.spacing(5),
      paddingBottom: theme.spacing(5),
    },
  },
}));

const Layout: React.FC<PropsWithChildren> = ({ children }) => (
  <>
    <RouteLoadingIndicator />
    <Header />
    <DashboardWrap>
      <EditorNavMenu />
      <DashboardContainer>
        <DndProvider backend={HTML5Backend}>{children}</DndProvider>
      </DashboardContainer>
    </DashboardWrap>
  </>
);

export default Layout;
