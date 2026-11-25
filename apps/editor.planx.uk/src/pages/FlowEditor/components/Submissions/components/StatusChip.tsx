import Chip from "@mui/material/Chip";
import type { RenderCellParams } from "ui/shared/DataTable/types";

import { AWAITING_PAYMENT_RETRY } from "../utils";

interface Props {
  status?: string;
  isAwaitingRetry?: boolean;
}

export const StatusChip: React.FC<Props> = ({ status, isAwaitingRetry }) => {
  if (!status) return null;

  if (status === AWAITING_PAYMENT_RETRY) {
    return <Chip label={status} size="small" color="warning" />;
  }
  if (status === "Payment_Failed") {
    return (
      <Chip
        label="Failed"
        size="small"
        color={isAwaitingRetry ? "warning" : "error"}
      />
    );
  }
  if (status.includes("failed") || status.includes("Failed")) {
    return <Chip label={status} size="small" color="error" />;
  }
  if (status === "Sending") {
    return <Chip label={status} size="small" color="sending" />;
  }
  if (
    [
      "Invited to pay",
      "Payment in progress",
      "Processing",
      "Initiated",
    ].includes(status)
  ) {
    return <Chip label={status} size="small" color="paymentPending" />;
  }
  if (["Success", "Succeeded"].includes(status)) {
    return <Chip label="Success" size="small" color="success" />;
  }

  return null;
};

export const StatusChipCell = (params: RenderCellParams) => (
  <StatusChip status={params.value} />
);
