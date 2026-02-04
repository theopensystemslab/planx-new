import Box from "@mui/material/Box";
import { containerClasses } from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import { useRouter } from "@tanstack/react-router";
import EditorNavMenu from "components/EditorNavMenu/EditorNavMenu";
import ErrorFallback from "components/Error/ErrorFallback";
import LoadingOverlay from "components/LoadingOverlay";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { PropsWithChildren, useEffect } from "react";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";
import { ErrorBoundary } from "react-error-boundary";
import WatermarkBackground from "ui/shared/WatermarkBackground";

import Header from "../../components/Header/Header";

const DashboardWrap = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  width: "100%",
  display: "flex",
  flexGrow: 1,
  position: "relative",
}));

const DashboardContainer = styled(Box)(({ theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.text.primary,
  display: "flex",
  flexDirection: "row",
  width: "100%",
  position: "relative",
  [`& > .${containerClasses.root}, & > div:not(.fixed-height-container) > .${containerClasses.root}`]:
    {
      paddingTop: theme.spacing(3),
      paddingBottom: theme.spacing(3),
      [theme.breakpoints.up("lg")]: {
        paddingTop: theme.spacing(5),
        paddingBottom: theme.spacing(5),
      },
    },
}));

const Layout: React.FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const initURLTracking = useStore((state) => state.initURLTracking);

  useEffect(() => {
    const cleanup = initURLTracking(router);
    return cleanup;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps - run once on mount

  return (
    <>
      <LoadingOverlay />
      <Header />
      <DashboardWrap>
        <EditorNavMenu />
        <DashboardContainer>
          <ErrorBoundary FallbackComponent={ErrorFallback}>
            <WatermarkBackground variant="dark" opacity={0.05} />
            <DndProvider backend={HTML5Backend}>{children}</DndProvider>
          </ErrorBoundary>
        </DashboardContainer>
      </DashboardWrap>
    </>
  );
};

export default Layout;
