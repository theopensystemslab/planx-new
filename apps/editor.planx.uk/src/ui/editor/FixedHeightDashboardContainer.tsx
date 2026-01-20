import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import React, { ReactNode } from "react";

interface FixedHeightDashboardContainerProps {
  children: ReactNode;
  bgColor?: string;
}

const FixedHeightDashboardContainer: React.FC<
  FixedHeightDashboardContainerProps
> = ({ children, bgColor, ...props }) => {
  return (
    <Box
      sx={(theme) => ({
        width: "100%",
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        backgroundColor: bgColor,
        paddingTop: theme.spacing(3),
        paddingBottom: theme.spacing(3),
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
