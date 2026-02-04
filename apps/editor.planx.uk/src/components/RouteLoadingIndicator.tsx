import Box from "@mui/material/Box";
import LinearProgress from "@mui/material/LinearProgress";
import { styled } from "@mui/material/styles";
import React from "react";

const Root = styled(Box)({
  width: "100%",
  position: "fixed",
  top: 0,
  left: 0,
});

const RouteLoadingIndicator: React.FC<{
  msDelayBeforeVisible?: number;
}> = ({ msDelayBeforeVisible = 50 }) => {
  return (
    <Root role="alert" aria-busy="true" aria-live="assertive">
      <LinearProgress />
    </Root>
  );
};

export default RouteLoadingIndicator;
