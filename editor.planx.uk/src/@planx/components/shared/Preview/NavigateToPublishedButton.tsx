import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";

import { InnerContainer } from "./SaveResumeButton";

const NavigateToPublishedButton: React.FC = () => {
  const [teamSlug, teamDomain, flowSlug] = useStore((state) => [
    state.teamSlug,
    state.teamDomain,
    state.flowSlug,
  ]);

  const subdomainLink = `https://${teamDomain}/${flowSlug}/published`;
  const standardLink = `${window.location.origin}/${teamSlug}/${flowSlug}/published`;

  const redirectLink = teamDomain ? subdomainLink : standardLink;

  const handleClick = () => {
    window.open(redirectLink, "_blank");
  };

  console.log(window.location.origin);

  return (
    <InnerContainer>
      <Typography variant="body1">or</Typography>
      <Link component="button" onClick={handleClick}>
        <Typography variant="body1" textAlign="left">
          Go to the live service
        </Typography>
      </Link>
    </InnerContainer>
  );
};

export default NavigateToPublishedButton;
