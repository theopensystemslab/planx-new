import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";

const Root = styled(Box)(() => ({
  padding: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
}));

const DelayedLoadingIndicator: React.FC<{
  msDelayBeforeVisible?: number;
  text?: string;
}> = ({ msDelayBeforeVisible = 0, text }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), msDelayBeforeVisible);
    return () => {
      clearTimeout(timeout);
    };
  }, [msDelayBeforeVisible]);

  return visible ? (
    <Root
      role="alert"
      aria-busy="true"
      aria-live="assertive"
      data-testid="delayed-loading-indicator"
    >
      <CircularProgress aria-label="Loading" />
      <Typography variant="body2" sx={{ pl: 1 }}>
        {text ?? "Loading…"}
      </Typography>
    </Root>
  ) : null;
};

export default DelayedLoadingIndicator;
