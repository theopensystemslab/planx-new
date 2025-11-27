import PreviewIcon from "@mui/icons-material/Preview";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { addDays, isBefore } from "date-fns";
import { DAYS_UNTIL_EXPIRY } from "lib/pay";
import React from "react";
import { useNavigation } from "react-navi";
import { RenderCellParams } from "ui/shared/DataTable/types";

export const ViewSubmissionButton = (params: RenderCellParams) => {
  const submissionDataExpirationDate = addDays(
    new Date(params.row.createdAt),
    DAYS_UNTIL_EXPIRY,
  );

  const sessionId = params.row.sessionId;

  const showViewButton =
    params.row.status === "Success" &&
    params.row.eventType !== "Pay" &&
    isBefore(new Date(), submissionDataExpirationDate);

  const { navigate } = useNavigation();

  if (!showViewButton) return;

  return (
    <Tooltip title="View application data">
      <IconButton
        aria-label="view application"
        onClick={() => navigate(`./submissions/${sessionId}`)}
      >
        <PreviewIcon />
      </IconButton>
    </Tooltip>
  );
};
