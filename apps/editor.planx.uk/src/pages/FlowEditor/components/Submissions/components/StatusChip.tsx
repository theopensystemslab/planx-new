import Chip from "@mui/material/Chip";
import React from "react";
import type { RenderCellParams } from "ui/shared/DataTable/types";

import type { Submission } from "../types";

type Props = RenderCellParams | { status: Submission["status"] };

const isRenderCellParams = (props: Props): props is RenderCellParams => {
  return "value" in props;
};

export const StatusChip = (props: Props) => {
  const statusValue = isRenderCellParams(props) ? props.value : props.status;

  return statusValue === "Success" ? (
    <Chip label="Success" size="small" color="success" />
  ) : (
    <Chip label={statusValue} size="small" color="error" />
  );
};
