import PreviewIcon from "@mui/icons-material/Preview";
import Button from "@mui/material/Button";
import { useNavigate } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { addDays, isBefore } from "date-fns";
import { DAYS_UNTIL_EXPIRY } from "lib/pay";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

type Props = {
  sessionId: string;
  submittedAt: string;
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
  const params = useParams({ strict: false });

  const handleClick = () => {
    if (params.flow) {
      navigate({
        to: "/app/$team/$flow/view-submission/$sessionId",
        params: {
          team: teamSlug,
          flow: params.flow,
          sessionId: props.sessionId,
        },
      });
    } else {
      navigate({
        to: "/app/$team/view-submission/$sessionId",
        params: {
          team: teamSlug,
          sessionId: props.sessionId,
        },
      });
    }
  };

  if (!showViewButton) return;

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={handleClick}
      disabled={!props.submittedAt}
    >
      <PreviewIcon sx={{ mr: 1 }} />
      View submission
    </Button>
  );
};
