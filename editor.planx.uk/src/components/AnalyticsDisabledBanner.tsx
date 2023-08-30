import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useState } from "react";
import AnalyticsChart from "ui/icons/AnalyticsChart";

const AnalyticsWarning = styled(Box)(() => ({
  display: "flex",
  backgroundColor: "#FFFB00",
  color: "#070707",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "0.2em 0",
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
          <Container
            maxWidth={false}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
            >
              <AnalyticsChart />
              <Typography variant="body2" ml={1}>
                <strong>Analytics off</strong> This is a preview link for
                testing. No usage data is being recorded.{"  "}
                <Link href={enableAnalytics()} color="inherit" mr={1}>
                  Go to normal link
                </Link>
              </Typography>
            </Box>
            <Button size="small" onClick={() => setShowAnalyticsWarning(false)}>
              Hide
            </Button>
          </Container>
        </AnalyticsWarning>
      )}
    </>
  );
};

export default AnalyticsDisabledBanner;
