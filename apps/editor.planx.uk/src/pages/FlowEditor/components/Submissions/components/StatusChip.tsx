import Chip from "@mui/material/Chip";
import React from "react";
import { RenderCellParams } from "ui/shared/DataTable/types";

export const StatusChip = (params: RenderCellParams) => {
  return params.value === "Success" ? (
    <Chip label="Success" size="small" color="success" />
  ) : (
    <Chip label={params.value} size="small" color="error" />
  );
};
