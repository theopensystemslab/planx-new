import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";

const Root = styled(Box)(() => ({
  padding: "0",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
}));

const SkeletonBox = styled(Box)(({ theme }) => ({
  width: "100%",
  maxWidth: theme.breakpoints.values.formWrap,
  height: "70px",
  background: "#F2F2F2",
  marginTop: "20px",
  overflow: "hidden",
  position: "relative",
  "&::after": {
    position: "absolute",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
    height: "100%",
    transform: "translateX(-100%)",
    background: `linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0,
      rgba(255, 255, 255, 0.2) 20%,
      rgba(255, 255, 255, 0.5) 60%,
      rgba(255, 255, 255, 0)
    )`,
    animation: "shimmer 1.5s infinite",
    content: '""',

    "@keyframes shimmer": {
      "100%": {
        transform: "translateX(100%)",
      },
    },
  },
}));

const DelayedLoadingSkeleton: React.FC<{
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
      data-testid="delayed-loading-skeleton"
    >
      <Typography variant="body1">{text ?? "Loading…"}</Typography>
      <SkeletonBox></SkeletonBox>
      <SkeletonBox></SkeletonBox>
    </Root>
  ) : null;
};

export default DelayedLoadingSkeleton;
