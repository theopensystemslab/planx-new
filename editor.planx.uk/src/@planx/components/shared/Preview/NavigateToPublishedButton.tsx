import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import React from "react";

import { InnerContainer } from "./SaveResumeButton";

const NavigateToPublishedButton: React.FC = () => {
  const testEnvironment = window.location.pathname.endsWith("/draft")
    ? "/draft"
    : "/preview";

  const editorLink = window.location.pathname.replace(
    testEnvironment,
    "/published",
  ) as `/${string}`;
  const redirectLink = `${window.location.origin}${editorLink}`;

  const handleClick = () => {
    window.open(redirectLink, "_blank");
  };

  return (
    <InnerContainer>
      <Typography variant="body1">or</Typography>
      <Link onClick={handleClick} component="button">
        <Typography variant="body1" textAlign="left">
          Go to the live service
        </Typography>
      </Link>
    </InnerContainer>
  );
};

export default NavigateToPublishedButton;
