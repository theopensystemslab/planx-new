import ReportIcon from "@mui/icons-material/Report";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { hasFeatureFlag } from "lib/featureFlags";
import React, { useState } from "react";

const TestEnvironmentWarning = styled(Box)(({ theme }) => ({
  display: "flex",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.2em 0",
}));

const FeatureFlagBanner: React.FC = () => {
  const [showWarning, setShowWarning] = useState(true);

  const isUsingFeatureFlag = () => hasFeatureFlag("DISABLE_SAVE_AND_RETURN");

  return (
    <>
      {isUsingFeatureFlag() && showWarning && (
        <TestEnvironmentWarning>
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
                You have <strong>disabled save and return</strong> via feature
                flag. This means you cannot save or submit your test
                applications.
              </Typography>
            </Box>
            <Button size="small" onClick={() => setShowWarning(false)}>
              Hide
            </Button>
          </Container>
        </TestEnvironmentWarning>
      )}
    </>
  );
};

export default FeatureFlagBanner;
