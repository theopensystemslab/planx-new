import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import { HEADER_HEIGHT_EDITOR } from "components/Header/Header";
import React, { ReactNode } from "react";

interface FixedHeightDashboardContainerProps {
  children: ReactNode;
  bgColor?: string;
  topOffset?: number;
}

const FixedHeightDashboardContainer: React.FC<
  FixedHeightDashboardContainerProps
> = ({ children, bgColor, topOffset = 0, ...props }) => {
  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: bgColor,
        paddingTop: theme.spacing(3 + topOffset),
        paddingBottom: theme.spacing(3),
        [theme.breakpoints.up("lg")]: {
          paddingTop: theme.spacing(3.5 + topOffset),
          paddingBottom: theme.spacing(3.5),
        },
      })}
      className="fixed-height-container"
      {...props}
    >
      <Container
        sx={{ height: "100%", display: "flex", flexDirection: "column", py: 5 }}
        maxWidth={false}
      >
        {children}
      </Container>
    </Box>
  );
};

export default FixedHeightDashboardContainer;
