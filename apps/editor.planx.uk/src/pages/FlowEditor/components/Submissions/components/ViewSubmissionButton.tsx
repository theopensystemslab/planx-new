import PreviewIcon from "@mui/icons-material/Preview";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { useNavigate, useParams } from "@tanstack/react-router";
import { addDays, isBefore } from "date-fns";
import { DAYS_UNTIL_EXPIRY } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import type { RenderCellParams } from "ui/shared/DataTable/types";

export const ViewSubmissionButton = (params: RenderCellParams) => {
  const submissionDataExpirationDate = addDays(
    new Date(params.row.createdAt),
    DAYS_UNTIL_EXPIRY,
  );
  const teamSlug = useStore((state) => state.teamSlug);
  const sessionId = params.row.sessionId;

  const showViewButton =
    params.row.status === "Success" &&
    params.row.eventType !== "Pay" &&
    isBefore(new Date(), submissionDataExpirationDate);

  const navigate = useNavigate();
  const urlParams = useParams({ strict: false });

  const handleClick = () => {
    if (urlParams.flow) {
      navigate({
        to: "/app/$team/$flow/submissions/$sessionId",
        params: {
          team: teamSlug,
          flow: urlParams.flow,
          sessionId: sessionId,
        },
        search: {},
      });
    } else {
      navigate({
        to: "/app/$team/submissions/$sessionId",
        params: {
          team: teamSlug,
          sessionId: sessionId,
        },
        search: {},
      });
    }
  };

  if (!showViewButton) return;

  return (
    <Tooltip title="View application data">
      <IconButton aria-label="view application" onClick={handleClick}>
        <PreviewIcon />
      </IconButton>
    </Tooltip>
  );
};
