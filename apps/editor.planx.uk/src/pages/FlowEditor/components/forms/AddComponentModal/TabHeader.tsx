import Box from "@mui/material/Box";
import type { PropsWithChildren } from "react";
import React from "react";

export const TabHeader: React.FC<PropsWithChildren> = ({ children }) => (
  <Box
    sx={{
      px: 1.5,
      py: 1.25,
      borderBottom: 1,
      borderColor: "divider",
      backgroundColor: "background.paper",
    }}
  >
    {children}
  </Box>
);
