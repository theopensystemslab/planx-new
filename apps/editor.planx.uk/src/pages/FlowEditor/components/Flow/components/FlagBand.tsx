import Box from "@mui/material/Box";
import { Flag } from "@opensystemslab/planx-core/types";
import React from "react";

export const FlagBand: React.FC<{
  flag: Flag;
}> = ({ flag }) => {
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: `${flag?.bgColor || theme.palette.grey[800]}`,
        borderBottom: `1px solid ${theme.palette.grey[400]}`,
        width: "100%",
        height: "12px",
      })}
    />
  );
};

export const NoFlagBand: React.FC = () => {
  return (
    <Box
      sx={(theme) => ({
        backgroundColor: theme.palette.grey[700],
        borderBottom: `1px solid ${theme.palette.grey[400]}`,
        width: "100%",
        height: "12px",
      })}
    />
  );
};
