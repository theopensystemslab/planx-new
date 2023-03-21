import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { styled } from "@mui/styles";
import React, { useState } from "react";
import AnalyticsChart from "ui/icons/AnalyticsChart";

const AnalyticsWarning = styled(Box)(({ theme }) => ({
  display: "flex",
  backgroundColor: "#FFFB00",
  padding: `0 ${theme.spacing(4)}`,
  color: "#070707",
  justifyContent: "space-between",
  alignItems: "center",
}));

const AnalyticsDisabledBanner: React.FC = () => {
  const [showAnalyticsWarning, setShowAnalyticsWarning] = useState(true);

  const isAnalyticsDisabled = () =>
    new URL(window.location.href).searchParams.get("analytics") === "false";

  const enableAnalytics = () => {
    const url = new URL(window.location.href);
    url.searchParams.delete("analytics");
    return url.toString();
  };

  return (
    <>
      {isAnalyticsDisabled() && showAnalyticsWarning && (
        <AnalyticsWarning>
          <Box display="flex" alignItems="center">
            <AnalyticsChart />
            <Typography variant="body2">
              <b>Analytics off</b> This is a preview link for testing. No usage
              data is being recorded.{"  "}
              <Link href={enableAnalytics()} color="inherit">
                Go to normal link
              </Link>
            </Typography>
          </Box>
          <Button onClick={() => setShowAnalyticsWarning(false)}>Hide</Button>
        </AnalyticsWarning>
      )}
    </>
  );
};

export default AnalyticsDisabledBanner;
