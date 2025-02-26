import Payment from "@mui/icons-material/Payment";
import Send from "@mui/icons-material/Send";
import Typography from "@mui/material/Typography";
import React from "react";
import { RenderCellParams } from "ui/shared/DataTable/types";

export const SubmissionEvent = (params: RenderCellParams) => {
  return (
    <>
      {params.value === "Pay" ? <Payment /> : <Send />}
      <Typography variant="body2" ml={1}>
        {params.value} {params.row.retry && ` [Retry]`}
      </Typography>
    </>
  );
};
