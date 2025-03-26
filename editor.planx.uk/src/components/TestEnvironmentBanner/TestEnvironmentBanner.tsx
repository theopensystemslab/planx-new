import ReportIcon from "@mui/icons-material/Report";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { HEADER_HEIGHT_EDITOR } from "../Header/Header";

const TestEnvironmentWarning = styled(Box, {
  shouldForwardProp: (prop) => prop !== "variant",
})<{ variant: BannerVariant }>(({ theme, variant }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.2em 0",
  minHeight: HEADER_HEIGHT_EDITOR,
  bottom: 0,
  ...(variant === "short" || variant === "full"
    ? {
        position: "fixed",
        bottom: 0,
        maxWidth: "150px",
      }
    : {}),
}));

type BannerVariant = "short" | "full" | "banner";

interface TestEnvironmentBannerProps {
  variant?: BannerVariant;
}

const TestEnvironmentBanner: React.FC<TestEnvironmentBannerProps> = ({
  variant = "short",
}) => {
  const [isTestEnvBannerVisible, hideTestEnvBanner] = useStore((state) => [
    state.isTestEnvBannerVisible,
    state.hideTestEnvBanner,
  ]);

  if (!isTestEnvBannerVisible) return null;

  return (
    <TestEnvironmentWarning variant={variant}>
      {variant === "short" && (
        <Box p={1}>
          <Tooltip
            placement="right"
            title="This is a testing environment for new features. Do not use it to make permanent content changes."
          >
            <Typography
              variant="body2"
              mb={0.5}
              sx={{ writingMode: "sideways-lr", textOrientation: "mixed" }}
            >
              <strong>Testing environment</strong>
            </Typography>
          </Tooltip>
          <ReportIcon color="error" />
        </Box>
      )}
      {variant === "full" && (
        <Box
          display="flex"
          alignItems="flex-start"
          flexDirection="column"
          p={1}
          pb={3}
        >
          <ReportIcon color="error" />
          <Typography variant="body2" fontSize="small" mt={1}>
            This is a <br />
            <strong>testing environment</strong> for new features.
          </Typography>
          <Typography variant="body2" fontSize="small" mt={1}>
            Do not use it to make permanent content changes.
          </Typography>
        </Box>
      )}
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
    </TestEnvironmentWarning>
  );
};

export default TestEnvironmentBanner;
