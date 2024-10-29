import Box from "@mui/material/Box";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

export const DataField: React.FC<{
  value: string;
  variant: "parent" | "child";
}> = ({ value, variant }) => {
  const showDataFields = useStore((state) => state.showDataFields);
  if (!showDataFields) return null;

  return (
    <Box
      sx={(theme) => ({
        fontFamily: theme.typography.data.fontFamily,
        fontSize: theme.typography.data,
        backgroundColor: "#f0f0f0",
        borderColor:
          variant === "parent"
            ? theme.palette.common.black
            : theme.palette.grey[400],
        borderWidth: variant === "parent" ? "0 1px 1px 1px" : "1px 0 0 0",
        borderStyle: "solid",
        width: "100%",
        p: 0.5,
        textAlign: "center",
      })}
    >
      {value}
    </Box>
  );
};
