import ReportIcon from "@mui/icons-material/Report";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { HEADER_HEIGHT_EDITOR } from "../Header/Header";

const TestEnvironmentWarning = styled(Box, {
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant: BannerVariant }>(({ theme, variant }) => ({
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  ...(variant === "banner"
    ? {
        minHeight: HEADER_HEIGHT_EDITOR,
        backgroundColor: theme.palette.background.paper,
        color: theme.palette.text.primary,
        padding: "0.2em 0",
      }
    : {
        gap: theme.spacing(0.5),
      }),
}));

type BannerVariant = "banner" | "header";

interface TestEnvironmentBannerProps {
  variant?: BannerVariant;
}

const TestEnvironmentBanner: React.FC<TestEnvironmentBannerProps> = ({
  variant = "banner",
}) => {
  const [isTestEnvBannerVisible, hideTestEnvBanner] = useStore((state) => [
    state.isTestEnvBannerVisible,
    state.hideTestEnvBanner,
  ]);

  if (!isTestEnvBannerVisible) return null;

  return (
    <TestEnvironmentWarning variant={variant}>
      {variant === "banner" && (
        <Container
          maxWidth={false}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box display="flex" alignItems="center">
            <ReportIcon color="error" />
            <Typography variant="body2" ml={1}>
              This is a <strong>testing environment</strong> for new features.
              Do not use it to make permanent content changes.
            </Typography>
          </Box>
          <Button size="small" onClick={hideTestEnvBanner}>
            Hide
            <Box sx={visuallyHidden} component="span">
              the test environment banner
            </Box>
          </Button>
        </Container>
      )}
      {variant === "header" && (
        <>
          <ReportIcon sx={(theme) => ({ color: theme.palette.error.light })} />
          <Typography variant="body2">
            <strong>Test environment</strong>
          </Typography>
        </>
      )}
    </TestEnvironmentWarning>
  );
};

export default TestEnvironmentBanner;
