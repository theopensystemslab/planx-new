import CancelIcon from "@mui/icons-material/Cancel";
import PendingIcon from "@mui/icons-material/Pending";
import CheckCircleIcon from "ui/icons/CheckCircle";

import type { Submission } from "../types";

interface Props {
  status: Submission["status"];
}

export const STATUS_ICON_SIZE = 28;

const iconSx = { fontSize: STATUS_ICON_SIZE };

const StatusIconMap: Record<
  NonNullable<Submission["status"]>,
  React.ReactElement
> = {
  Success: <CheckCircleIcon color="success" sx={iconSx} />,
  Succeeded: <CheckCircleIcon color="success" sx={iconSx} />,
  Submitted: <CheckCircleIcon color="success" sx={iconSx} />,
  Failed: <CancelIcon color="error" sx={iconSx} />,
  "Failed (500)": <CancelIcon color="error" sx={iconSx} />,
  "Failed (502)": <CancelIcon color="error" sx={iconSx} />,
  "Failed (503)": <CancelIcon color="error" sx={iconSx} />,
  "Failed (504)": <CancelIcon color="error" sx={iconSx} />,
  "Failed (400)": <CancelIcon color="error" sx={iconSx} />,
  "Failed (401)": <CancelIcon color="error" sx={iconSx} />,
  // GOV.UK Pay
  Started: <PendingIcon color="info" sx={iconSx} />,
  Capturable: <PendingIcon color="warning" sx={iconSx} />,
  Cancelled: <CancelIcon color="disabled" sx={iconSx} />,
  // Stripe
  Initiated: <PendingIcon color="info" sx={iconSx} />,
  Processing: <PendingIcon color="warning" sx={iconSx} />,
  Payment_failed: <CancelIcon color="disabled" sx={iconSx} />,
  Error: <CancelIcon color="error" sx={iconSx} />,
  Unknown: <CancelIcon color="error" sx={iconSx} />,
};

export const StatusIcon: React.FC<Props> = ({ status }) => {
  if (!status) return null;
  return StatusIconMap[status] || null;
};
