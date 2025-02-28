import Typography from "@mui/material/Typography";
import React from "react";
import { RenderCellParams } from "ui/shared/DataTable/types";

export const SubmissionEvent = (params: RenderCellParams) => {
  return (
    <Typography variant="body2">
      {params.value} {params.row.retry && ` [Retry]`}
    </Typography>
  );
};
