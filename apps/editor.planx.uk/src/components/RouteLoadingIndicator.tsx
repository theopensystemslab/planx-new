import Box from "@mui/material/Box";
import LinearProgress, {
  linearProgressClasses,
} from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";

const Root = styled(Box)({
  width: "100%",
  position: "fixed",
  top: 0,
  left: 0,
});

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: "3px",
  backgroundColor: theme.palette.background.dark,
  [`& .${linearProgressClasses.bar}`]: {
    backgroundColor: theme.palette.secondary.dark,
  },
}));

const RouteLoadingIndicator: React.FC = () => {
  const [progress, setProgress] = useState(10);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        // Exponential decay toward 90% — slows as it approaches the cap
        const next = prev + (90 - prev) * 0.3;
        if (next >= 90) {
          clearInterval(timer);
          return 90;
        }
        return next;
      });
    }, 150);

    return () => clearInterval(timer);
  }, []);

  return (
    <Root role="alert" aria-busy="true" aria-live="assertive">
      <StyledLinearProgress variant="determinate" value={progress} />
    </Root>
  );
};

export default RouteLoadingIndicator;
