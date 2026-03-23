import Box from "@mui/material/Box";
import { keyframes, styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";

const pulseAnimation = keyframes`
  0% {
    transform: scale(0);
    opacity: 0;
  }
  5% {
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0;
  }
`;

const Loader = styled("span")(({ theme }) => ({
  width: 24,
  height: 24,
  display: "inline-block",
  position: "relative",
  "&::after, &::before": {
    content: '""',
    boxSizing: "border-box",
    width: 24,
    height: 24,
    borderRadius: "50%",
    background: theme.palette.text.primary,
    position: "absolute",
    left: 0,
    top: 0,
    opacity: 0,
    transform: "scale(0)",
    animation: `${pulseAnimation} 2s linear infinite`,
  },
  "&::after": {
    animationDelay: "1s",
  },
}));

const LoadingStage = styled(Box)(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  gap: theme.spacing(1),
  opacity: 0,
  transition: "opacity 0.5s ease-in",
}));

export interface ProgressiveLoadingProps {
  stages: string[];
  interval?: number;
}

const ProgressiveLoading: React.FC<ProgressiveLoadingProps> = ({
  stages,
  interval = 1000,
}) => {
  const [visibleStages, setVisibleStages] = useState(0);

  useEffect(() => {
    if (visibleStages < stages.length - 1) {
      const timer = setTimeout(() => {
        setVisibleStages((prev) => prev + 1);
      }, interval);
      return () => clearTimeout(timer);
    }
  }, [visibleStages, stages.length, interval]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        mt: 2,
        maxWidth: "100%",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
        {stages.map((stage, index) => {
          const isVisible = index <= visibleStages;
          return (
            <LoadingStage
              key={stage}
              sx={{
                ...(isVisible && { opacity: 1 }),
              }}
            >
              <Loader
                aria-hidden="true"
                sx={{ visibility: isVisible ? "visible" : "hidden" }}
              />
              <Typography variant="body1">{stage}</Typography>
            </LoadingStage>
          );
        })}
      </Box>
    </Box>
  );
};

export default ProgressiveLoading;
