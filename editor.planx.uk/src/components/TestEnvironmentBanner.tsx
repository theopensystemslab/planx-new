import ReportIcon from "@mui/icons-material/Report";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";

const TestEnvironmentWarning = styled(Box)(({ theme }) => ({
  display: "flex",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.2em 0",
}));

const TestEnvironmentBanner: React.FC = () => {
  const [showWarning, setShowWarning] = useState(true);

  const isTestEnvironment = () => !window.location.href.includes(".uk");

  return (
    <>
      {isTestEnvironment() && showWarning && (
        <TestEnvironmentWarning>
          <Container
            maxWidth="xl"
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
            <Button onClick={() => setShowWarning(false)}>Hide</Button>
          </Container>
        </TestEnvironmentWarning>
      )}
    </>
  );
};

export default TestEnvironmentBanner;
