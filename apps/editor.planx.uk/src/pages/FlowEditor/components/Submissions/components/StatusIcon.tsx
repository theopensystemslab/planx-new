import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import PendingIcon from "@mui/icons-material/Pending";
import React from "react";

import type { Submission } from "../types";

interface Props {
  status: Submission["status"];
}

const StatusIconMap: Record<
  NonNullable<Submission["status"]>,
  React.ReactElement
> = {
  Success: <CheckCircleIcon color="success" fontSize="medium" />,
  Submitted: <CheckCircleIcon color="success" fontSize="medium" />,
  Failed: <CancelIcon color="error" fontSize="medium" />,
  "Failed (500)": <CancelIcon color="error" fontSize="medium" />,
  "Failed (502)": <CancelIcon color="error" fontSize="medium" />,
  "Failed (503)": <CancelIcon color="error" fontSize="medium" />,
  "Failed (504)": <CancelIcon color="error" fontSize="medium" />,
  "Failed (400)": <CancelIcon color="error" fontSize="medium" />,
  "Failed (401)": <CancelIcon color="error" fontSize="medium" />,
  Started: <PendingIcon color="info" fontSize="medium" />,
  Capturable: <PendingIcon color="warning" fontSize="medium" />,
  Cancelled: <CancelIcon color="disabled" fontSize="medium" />,
  Error: <CancelIcon color="error" fontSize="medium" />,
  Unknown: <CancelIcon color="error" fontSize="medium" />,
};

export const StatusIcon: React.FC<Props> = ({ status }) => {
  if (!status) return null;
  return StatusIconMap[status] || null;
};
