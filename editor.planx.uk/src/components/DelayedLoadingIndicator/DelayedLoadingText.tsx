import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";

const LoadingText = styled(Typography)(() => ({
  "&::after": {
    display: "inline-block",
    animation: "ellipsis steps(1,end) 1s infinite",
    content: '""',
  },
  "@keyframes ellipsis": {
    "0%": { content: '""' },
    "25%": { content: '"."' },
    "50%": { content: '".."' },
    "75%": { content: '"..."' },
    "100%": { content: '""' },
  },
}));

const DelayedLoadingText: React.FC<{
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
    <Box
      role="alert"
      aria-busy="true"
      aria-live="assertive"
      data-testid="delayed-loading-text"
      pt={2}
    >
      <LoadingText variant="body1">{text ?? "Loading…"}</LoadingText>
    </Box>
  ) : null;
};

export default DelayedLoadingText;
