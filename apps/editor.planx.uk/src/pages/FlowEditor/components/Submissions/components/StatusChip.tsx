import Chip from "@mui/material/Chip";
import React from "react";
import type { RenderCellParams } from "ui/shared/DataTable/types";

export const StatusChip = (params: RenderCellParams) => {
  if (params.value.includes("failed")) {
    return <Chip label={params.value} size="small" color="error" />;
  }
  if (params.value === "Sending") {
    return <Chip label={params.value} size="small" color="sending" />;
  }
  if (
    params.value === "Invited to pay" ||
    params.value === "Payment in progress"
  ) {
    return <Chip label={params.value} size="small" color="paymentPending" />;
  }
  if (params.value === "Success") {
    return <Chip label={params.value} size="small" color="success" />;
  }
};
