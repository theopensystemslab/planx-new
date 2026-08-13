import CancelIcon from "@mui/icons-material/Cancel";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";
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
  Success: <CheckCircleIcon color="success" fontSize="small" />,
  Submitted: <CheckCircleIcon color="success" fontSize="small" />,
  Failed: <CancelIcon color="error" fontSize="small" />,
  "Failed (500)": <CancelIcon color="error" fontSize="small" />,
  "Failed (502)": <CancelIcon color="error" fontSize="small" />,
  "Failed (503)": <CancelIcon color="error" fontSize="small" />,
  "Failed (504)": <CancelIcon color="error" fontSize="small" />,
  "Failed (400)": <CancelIcon color="error" fontSize="small" />,
  "Failed (401)": <CancelIcon color="error" fontSize="small" />,
  Started: <PendingIcon color="info" fontSize="small" />,
  Capturable: <PendingIcon color="warning" fontSize="small" />,
  Cancelled: <CancelIcon color="disabled" fontSize="small" />,
  Error: <ErrorIcon color="error" fontSize="small" />,
  Unknown: <PendingIcon color="disabled" fontSize="small" />,
};

export const StatusIcon: React.FC<Props> = ({ status }) => {
  if (!status) return null;
  return StatusIconMap[status] || null;
};
