import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { useNavigation } from "react-navi";

import { InnerContainer } from "./SaveResumeButton";

const NavigateToPublishedButton: React.FC = () => {
  const navigate = useNavigation();
  const [teamSlug, flowSlug] = useStore((state) => [
    state.teamSlug,
    state.flowSlug,
  ]);
  const handleClick = () => {
    window.open(
      `${window.location.origin}/${teamSlug}/${flowSlug}/published`,
      "_blank",
    );
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
