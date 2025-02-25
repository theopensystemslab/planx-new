import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { HEADER_HEIGHT_EDITOR } from "components/Header/Header";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { ReactNode } from "react";

interface FixedHeightDashboardContainerProps {
  children: ReactNode;
}

const FixedHeightDashboardContainer: React.FC<
  FixedHeightDashboardContainerProps
> = ({ children, ...props }) => {
  const isTestEnvBannerVisible = useStore(
    (state) => state.isTestEnvBannerVisible,
  );

  const containerHeight = isTestEnvBannerVisible
    ? `calc(100vh - ${HEADER_HEIGHT_EDITOR * 2}px)`
    : `calc(100vh - ${HEADER_HEIGHT_EDITOR}px)`;

  return (
    <Box
      sx={{
        width: "100%",
        height: containerHeight,
        display: "flex",
        flexDirection: "column",
      }}
      {...props}
    >
      <Container
        sx={{ height: "100%", display: "flex", flexDirection: "column" }}
        maxWidth={false}
      >
        {children}
      </Container>
    </Box>
  );
};

export default FixedHeightDashboardContainer;
