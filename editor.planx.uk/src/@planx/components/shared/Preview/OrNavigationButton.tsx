import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import React from "react";

import { contentFlowSpacing, OrNavigationType } from "./Card";
import NavigateToPublishedButton from "./NavigateToPublishedButton";
import SaveResumeButton from "./SaveResumeButton";

type OrNavigationProps = {
  type: OrNavigationType;
};

export const InnerContainer = styled(Box)(({ theme }) => ({
  "& p": {
    ...contentFlowSpacing(theme),
  },
}));

const OrNavigationButton = ({ type }: OrNavigationProps) => {
  const BUTTON_COMPONENTS = {
    "save-resume": SaveResumeButton,
    "navigate-to-published": NavigateToPublishedButton,
  } as const;

  const ButtonComponent = BUTTON_COMPONENTS[type];

  return (
    <InnerContainer>
      <Typography variant="body1">or</Typography>
      {<ButtonComponent />}
    </InnerContainer>
  );
};

export default OrNavigationButton;
