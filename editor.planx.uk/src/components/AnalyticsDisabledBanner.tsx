import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import Link from "@material-ui/core/Link";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { useState } from "react";
import AnalyticsChart from "ui/icons/AnalyticsChart";

const useStyles = makeStyles((theme) => ({
  analyticsWarning: {
    display: "flex",
    backgroundColor: "#FFFB00",
    padding: "0 24px",
    color: "#070707",
    justifyContent: "space-between",
    alignItems: "center",
  },
}));

const AnalyticsDisabledBanner: React.FC = () => {
  const classes = useStyles();
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
        <Box className={classes.analyticsWarning}>
          <Box display="flex" alignItems="center">
            <AnalyticsChart />
            <Typography variant="body2">
              <b>Analytics off</b> This is a preview link for testing. No usage
              data is being recorded.{"  "}
              <Link href={enableAnalytics()}>Go to normal link</Link>
            </Typography>
          </Box>
          <Button onClick={() => setShowAnalyticsWarning(false)}>Hide</Button>
        </Box>
      )}
    </>
  );
};

export default AnalyticsDisabledBanner;
