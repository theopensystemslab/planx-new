import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import React, { PropsWithChildren } from "react";

const Container: React.FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      width: "100%",
      height: "100vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "flex-start",
      pt: 4,
    }}
  >
    {children}
  </Box>
);

const TerminalNode = () => (
  <Skeleton
    variant="circular"
    width={50}
    height={50}
    sx={{ bgcolor: "rgba(0,0,0,0.11)" }}
  />
);

const Hanger = () => (
  <Skeleton
    variant="circular"
    width={15}
    height={15}
    sx={{ bgcolor: "rgba(0,0,0,0.11)" }}
  />
);

const Node = () => (
  <Skeleton
    variant="rectangular"
    width={150}
    height={30}
    sx={{ bgcolor: "rgba(0,0,0,0.11)" }}
  />
);

const VerticalConnector = () => (
  <Skeleton
    variant="rectangular"
    width={4}
    height={10}
    sx={{ bgcolor: "rgba(0,0,0,0.11)" }}
  />
);

const HorizontalConnector = () => (
  <Skeleton
    variant="rectangular"
    width={234}
    height={4}
    sx={{ bgcolor: "rgba(0,0,0,0.11)" }}
  />
);

export const FlowSkeleton = () => {
  return (
    <Container>
      <TerminalNode />
      <VerticalConnector />
      <Hanger />
      <VerticalConnector />
      <Node />
      <VerticalConnector />
      <Hanger />
      <VerticalConnector />
      <Node />
      <VerticalConnector />
      <Hanger />
      <VerticalConnector />
      <Node />
      <VerticalConnector />
      <HorizontalConnector />
      <Box
        sx={{
          display: "flex",
          gap: 8,
          width: 250,
          justifyContent: "center",
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <VerticalConnector />
          <Node />
          <VerticalConnector />
          <Hanger />
          <VerticalConnector />
        </Box>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <VerticalConnector />
          <Node />
          <VerticalConnector />
          <Hanger />
          <VerticalConnector />
        </Box>
      </Box>
      <HorizontalConnector />
      <VerticalConnector />
      <Hanger />
      <VerticalConnector />
      <TerminalNode />
    </Container>
  );
};

export default FlowSkeleton;
