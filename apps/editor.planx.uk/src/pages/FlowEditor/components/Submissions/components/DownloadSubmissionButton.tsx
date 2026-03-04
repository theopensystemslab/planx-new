import { useQuery } from "@apollo/client";
import CloudDownload from "@mui/icons-material/CloudDownload";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { addDays, isBefore } from "date-fns";
import { DAYS_UNTIL_EXPIRY } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { RenderCellParams } from "ui/shared/DataTable/types";

import { GET_TEAM_SUBMISSION_INTEGRATIONS } from "../../Settings/Team/Integrations/SubmissionEmails/queries";
import { GetSubmissionEmails } from "../../Settings/Team/Integrations/SubmissionEmails/types";

export const DownloadSubmissionButton = (params: RenderCellParams) => {
  const [teamId, teamSlug, canUserEditTeam] = useStore((state) => [
    state.teamId,
    state.teamSlug,
    state.canUserEditTeam,
  ]);

  const { data, loading } = useQuery<GetSubmissionEmails>(
    GET_TEAM_SUBMISSION_INTEGRATIONS,
    {
      variables: { teamId },
    },
  );

  // TODO does it matter *which* submission email is used to download in this case ??
  //   Should this instead use sessionID -> flowID -> **flow** email ?
  const emails = data?.submissionIntegrations;
  let submissionEmail;
  if (emails) {
    submissionEmail = emails?.[0].submissionEmail;
  }

  const submissionDataExpirationDate = addDays(
    new Date(params.row.createdAt),
    DAYS_UNTIL_EXPIRY,
  );

  const showDownloadButton =
    teamSlug &&
    canUserEditTeam(teamSlug) &&
    !loading &&
    submissionEmail &&
    params.row.status === "Success" &&
    params.row.eventType !== "Pay" &&
    isBefore(new Date(), submissionDataExpirationDate);

  if (!showDownloadButton) return;

  const zipUrl = `${import.meta.env.VITE_APP_API_URL}/download-application-files/${
    params.row.sessionId
  }?localAuthority=${teamSlug}&email=${submissionEmail}`;

  return (
    <Tooltip title="Download application data">
      <IconButton
        aria-label="download application"
        onClick={() => window.open(zipUrl, "_blank")}
      >
        <CloudDownload />
      </IconButton>
    </Tooltip>
  );
};
