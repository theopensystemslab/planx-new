import Chip from "@mui/material/Chip";
import type { RenderCellParams } from "ui/shared/DataTable/types";

interface Props {
  status?: string;
}

export const StatusChip: React.FC<Props> = ({ status }) => {
  if (!status) return null;

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
