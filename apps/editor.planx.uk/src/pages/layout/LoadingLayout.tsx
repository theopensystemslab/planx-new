import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Skeleton from "@mui/material/Skeleton";
import { styled } from "@mui/material/styles";
import MuiToolbar from "@mui/material/Toolbar";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import {
  HEADER_HEIGHT_PUBLIC,
  InnerContainer,
  LeftBox,
  RightBox,
} from "components/Header/Header";
import React, { useEffect, useState } from "react";
import { useLoadingRoute, View } from "react-navi";

export const loadingView = () => <LoadingLayout />;

const Root = styled(AppBar)(({ theme }) => ({
  color: theme.palette.common.white,
}));

const PublicHeader = styled(MuiToolbar)(() => ({
  height: HEADER_HEIGHT_PUBLIC,
}));

const LoadingSkeleton: React.FC = () => {
  return (
    <Container maxWidth="contentWrap" sx={{ my: 2 }}>
      <Box sx={{ mb: 4 }}>
        <DelayedLoadingIndicator
          variant="ellipses"
          text="Service loading"
          msDelayBeforeVisible={0}
        />
      </Box>

      <Box
        sx={(theme) => ({
          backgroundColor: theme.palette.background.paper,
          p: 3,
          mb: 3,
        })}
      >
        <Skeleton variant="text" width="80%" height={32} sx={{ mb: 2 }} />
        <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="90%" height={24} sx={{ mb: 3 }} />
      </Box>

      <Box sx={{ display: "flex", justifyContent: "space-between", mt: 3 }}>
        <Skeleton variant="rectangular" width={100} height={42} />
      </Box>
    </Container>
  );
};

const PublicLoadingHeader: React.FC = () => {
  return (
    <Root
      position="static"
      elevation={0}
      color="transparent"
      sx={(theme) => ({
        backgroundColor: theme.palette.background.dark,
      })}
    >
      <PublicHeader disableGutters>
        <Container maxWidth="contentWrap">
          <InnerContainer>
            <LeftBox>
              <Skeleton
                variant="rectangular"
                width={140}
                height={40}
                sx={{ bgcolor: "rgba(255, 255, 255, 0.15)" }}
              />
            </LeftBox>
            <RightBox>
              <Skeleton
                variant="rectangular"
                width={100}
                height={25}
                sx={{ bgcolor: "rgba(255, 255, 255, 0.15)" }}
              />
            </RightBox>
          </InnerContainer>
        </Container>
      </PublicHeader>
    </Root>
  );
};

export const LoadingLayout: React.FC = () => {
  const isLoading = useLoadingRoute();
  const [visible, setVisible] = useState(false);

  const FORCE_LOADING = false; // use fo setting up styles

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), 150);
    return () => clearTimeout(timeout);
  }, []);

  if (!isLoading && !FORCE_LOADING) {
    return <View />;
  }

  if (!visible) {
    return null;
  }

  return (
    <Box
      role="alert"
      aria-busy="true"
      aria-live="polite"
      data-testid="loading-layout"
    >
      <PublicLoadingHeader />
      <LoadingSkeleton />
    </Box>
  );
};
