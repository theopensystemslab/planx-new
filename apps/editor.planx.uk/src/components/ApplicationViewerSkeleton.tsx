import Box from "@mui/material/Box";
import Skeleton from "@mui/material/Skeleton";
import React from "react";

const ApplicationLoadingSkeleton = () => (
  <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pb: 2 }}>
    <Skeleton variant="text" sx={{ fontSize: "4rem" }} />
    <Skeleton variant="rectangular" width={650} height={650} />
    <Skeleton variant="rectangular" width={1000} height={185} />
    <Skeleton variant="text" width={200} sx={{ fontSize: "2rem" }} />
    <Skeleton variant="rectangular" width={1000} height={185} />
    <Skeleton variant="text" width={200} sx={{ fontSize: "2rem" }} />
    <Skeleton variant="rectangular" width={1000} height={185} />
  </Box>
)

export default ApplicationLoadingSkeleton;