import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import DelayedLoadingIndicator from "components/DelayedLoadingIndicator/DelayedLoadingIndicator";
import React from "react";

const LoadingSkeleton: React.FC = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      gap: 2,
      mt: 2,
      maxWidth: "100%",
      "& span": {
        maxWidth: "100%",
      },
    }}
  >
    <DelayedLoadingIndicator
      variant="ellipses"
      text="Analysing your project description"
      msDelayBeforeVisible={0}
    />
    <Box maxWidth="formWrap">
      <Skeleton variant="text" width="60%" height={40} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="40%" />
      <Skeleton variant="text" width="30%" height={30} />
    </Box>
    <Box sx={{ display: "flex", gap: 2, maxWidth: "100%" }}>
      <Skeleton
        variant="rectangular"
        width={900}
        height={180}
        aria-hidden="true"
      />
      <Skeleton
        variant="rectangular"
        width={900}
        height={180}
        aria-hidden="true"
      />
    </Box>
    <Box maxWidth="formWrap">
      <Skeleton
        variant="rectangular"
        width={900}
        height={200}
        aria-hidden="true"
      />
    </Box>
  </Box>
)

export default LoadingSkeleton;