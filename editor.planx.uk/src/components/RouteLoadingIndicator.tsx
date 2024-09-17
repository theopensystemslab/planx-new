import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import React, { useEffect, useState } from "react";
import { useLoadingRoute } from "react-navi";

const Root = styled(Box)({
  width: "100%",
  position: "fixed",
  top: 0,
  left: 0,
});

const RouteLoadingIndicator: React.FC<{
  msDelayBeforeVisible?: number;
}> = ({ msDelayBeforeVisible = 50 }) => {
  const isLoading = useLoadingRoute();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isLoading) return setIsVisible(false);

    const timer = setTimeout(() => setIsVisible(true), msDelayBeforeVisible);
    return () => clearTimeout(timer);
  }, [isLoading, msDelayBeforeVisible]);

  if (!isVisible) return null;

  return (
    <Root role="alert" aria-busy="true" aria-live="assertive">
      <LinearProgress />
    </Root>
  );
};

export default RouteLoadingIndicator;