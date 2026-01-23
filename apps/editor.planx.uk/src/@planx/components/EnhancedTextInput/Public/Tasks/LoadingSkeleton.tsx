import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import { keyframes, styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState } from "react";

const animloader = keyframes`
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

const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
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
    animation: `${animloader} 2s linear infinite`,
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

const LOADING_STAGES = [
  "Analysing your project description",
  "Considering local planning requirements",
  "Generating suggested improvements",
];

const LoadingSkeleton: React.FC = () => {
  const [visibleStages, setVisibleStages] = useState(1);

  useEffect(() => {
    if (visibleStages < LOADING_STAGES.length) {
      const timer = setTimeout(() => {
        setVisibleStages((prev) => prev + 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [visibleStages]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        mt: 2,
        maxWidth: "100%",
      }}
    >
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        {LOADING_STAGES.map((stage, index) => {
          const isVisible = index < visibleStages;
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
              <Typography variant="body2">{stage}</Typography>
            </LoadingStage>
          );
        })}
      </Box>
      <Box maxWidth="formWrap" mt={1}>
        <Skeleton variant="text" width={240} height={50} />
      </Box>
      <Box sx={{ display: "flex", gap: 2, mt: 1, maxWidth: "contentWrap" }}>
        <Skeleton
          variant="rectangular"
          width={900}
          height={250}
          aria-hidden="true"
        />
        <Skeleton
          variant="rectangular"
          width={900}
          height={250}
          aria-hidden="true"
        />
      </Box>
    </Box>
  );
};

export default LoadingSkeleton;
