import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useNavigate } from "@tanstack/react-router";
import { clearLocalFlow } from "lib/local";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

const NavigateToPublishedButton: React.FC = () => {
  const navigate = useNavigate();
  const id = useStore().id;
  const teamSlug = useStore((state) => state.teamSlug);
  const flowSlug = useStore((state) => state.flowSlug);

  const handleClick = () => {
    clearLocalFlow(id);
    navigate({
      to: "/$team/$flow/published",
      params: {
        team: teamSlug,
        flow: flowSlug,
      },
      search: {
        analytics: false,
      },
    });
    window.location.reload();
  };

  return (
    <Link onClick={handleClick} component="button">
      <Typography variant="body1" textAlign="left">
        Go to the published version of this service
      </Typography>
    </Link>
  );
};

export default NavigateToPublishedButton;
