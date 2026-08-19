import PreviewIcon from "@mui/icons-material/Preview";
import Button from "@mui/material/Button";
import { useNavigate } from "@tanstack/react-router";
import { addDays, isBefore } from "date-fns";
import { DAYS_UNTIL_EXPIRY } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

type Props = {
  sessionId: string;
  submittedAt?: string;
};

export const ViewSubmissionButtonGrouped = (props: Props) => {
  const submissionDataExpirationDate = props.submittedAt
    ? addDays(new Date(props.submittedAt), DAYS_UNTIL_EXPIRY)
    : null;

  const teamSlug = useStore((state) => state.teamSlug);

  const showViewButton = submissionDataExpirationDate
    ? isBefore(new Date(), submissionDataExpirationDate)
    : false;

  const navigate = useNavigate();

  if (!showViewButton) return;

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={() =>
        navigate({
          to: `/app/$team/submission/$sessionId`,
          params: { team: teamSlug, sessionId: props.sessionId },
        })
      }
      disabled={!props.submittedAt}
    >
      <PreviewIcon sx={{ mr: 1 }} />
      View submission
    </Button>
  );
};
