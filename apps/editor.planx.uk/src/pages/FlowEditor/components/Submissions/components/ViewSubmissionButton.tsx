import PreviewIcon from "@mui/icons-material/Preview";
import Button from "@mui/material/Button";
import { useNavigate } from "@tanstack/react-router";
import { useParams } from "@tanstack/react-router";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

type Props = {
  sessionId: string;
  submittedAt: string;
};

export const ViewSubmissionButton = (props: Props) => {
  const teamSlug = useStore((state) => state.teamSlug);

  const navigate = useNavigate();
  const params = useParams({ strict: false });

  const handleClick = () => {
    if (params.flow) {
      navigate({
        to: "/app/$team/$flow/submissions/$sessionId",
        params: {
          team: teamSlug,
          flow: params.flow,
          sessionId: props.sessionId,
        },
        search: undefined,
      });
    } else {
      navigate({
        to: "/app/$team/submissions/$sessionId",
        params: {
          team: teamSlug,
          sessionId: props.sessionId,
        },
        search: undefined,
      });
    }
  };

  return (
    <Button
      color="primary"
      variant="contained"
      onClick={handleClick}
      disabled={!props.submittedAt}
      startIcon={<PreviewIcon />}
    >
      View submission
    </Button>
  );
};
