import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useParams } from "@tanstack/react-router";
import { useNavigate } from "@tanstack/react-router";
import { clearLocalFlow } from "lib/local";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

const NavigateToPublishedButton: React.FC = () => {
  const navigate = useNavigate();
  const id = useStore((state) => state.id);
  const params = useParams({ from: "/_public/_planXDomain/$team/$flow" });

  const handleClick = () => {
    clearLocalFlow(id);
    navigate({
      to: "/$team/$flow/published",
      search: {
        analytics: false,
      },
      params,
    });
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
