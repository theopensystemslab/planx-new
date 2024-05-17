import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";

export interface Props {
  inline?: boolean;
}

const Root = styled(Box, {
  shouldForwardProp: (prop) => prop !== "inline",
})<Props>(({ inline, theme }) => ({
  padding: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  ...(inline && {
    padding: 0,
  }),
}));

const DelayedLoadingIndicator: React.FC<{
  msDelayBeforeVisible?: number;
  text?: string;
  inline?: boolean;
}> = ({ msDelayBeforeVisible = 0, text, inline }) => {
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
      inline={inline}
    >
      <CircularProgress size={inline ? 30 : 40} aria-label="Loading" />
      <Typography variant="body2" sx={{ ml: "1rem" }}>
        {text ?? "Loading..."}
      </Typography>
    </Root>
  ) : null;
};

export default DelayedLoadingIndicator;
