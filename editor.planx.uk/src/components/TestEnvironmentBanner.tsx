import ReportIcon from "@mui/icons-material/Report";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";

import { getHeaderPadding } from "./Header";

const TestEnvironmentWarning = styled(Box)(({ theme }) => ({
  display: "flex",
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  justifyContent: "space-between",
  alignItems: "center",
  ...getHeaderPadding(theme),
}));

const TestEnvironmentBanner: React.FC = () => {
  const [showWarning, setShowWarning] = useState(true);

  const isTestEnvironment = () => !window.location.href.includes(".uk");

  return (
    <>
      {isTestEnvironment() && showWarning && (
        <TestEnvironmentWarning>
          <Box display="flex" alignItems="center">
            <ReportIcon color="error" />
            <Typography variant="body2" ml={1}>
              This is a <strong>testing environment</strong> for new features.
              Do not use it to make permanent content changes.
            </Typography>
          </Box>
          <Button onClick={() => setShowWarning(false)}>Hide</Button>
        </TestEnvironmentWarning>
      )}
    </>
  );
};

export default TestEnvironmentBanner;
