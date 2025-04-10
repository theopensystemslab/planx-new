import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";

export interface Props {
  inline?: boolean;
  variant?: "spinner" | "ellipses";
  text?: string;
  msDelayBeforeVisible?: number;
}

const SpinnerRoot = styled(Box, {
  shouldForwardProp: (prop) => prop !== "inline",
})<Pick<Props, "inline">>(({ inline }) => ({
  padding: 60,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  ...(inline && {
    padding: 0,
  }),
}));

const EllipsesText = styled(Typography)(() => ({
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

const DelayedLoadingIndicator: React.FC<Props> = ({
  inline,
  text,
  msDelayBeforeVisible = 0,
  variant = "spinner",
}) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setVisible(true), msDelayBeforeVisible);
    return () => clearTimeout(timeout);
  }, [msDelayBeforeVisible]);

  if (!visible) return null;

  if (variant === "ellipses") {
    return (
      <Box
        role="alert"
        aria-busy="true"
        aria-live="assertive"
        data-testid="delayed-loading-text"
        pt={2}
      >
        <EllipsesText variant="body1">{text ?? "Loading…"}</EllipsesText>
      </Box>
    );
  }
  return (
    <SpinnerRoot
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
    </SpinnerRoot>
  );
};

export default DelayedLoadingIndicator;
