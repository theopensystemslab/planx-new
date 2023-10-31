import Box from "@mui/material/Box";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ApplicationPath } from "types";

import { contentFlowSpacing } from "./Card";

const InnerContainer = styled(Box)(({ theme }) => ({
  "& p": {
    ...contentFlowSpacing(theme),
  },
}));

const SaveResumeButton: React.FC = () => {
  const saveToEmail = useStore((state) => state.saveToEmail);
  const { trackFlowDirectionChange } = useAnalyticsTracking();

  const handleClick = () => {
    if (saveToEmail) {
      trackFlowDirectionChange("save");
      useStore.setState({ path: ApplicationPath.Save });
    } else {
      useStore.setState({ path: ApplicationPath.Resume });
    }
  };

  const onClick = () => handleClick();

  return (
    <InnerContainer>
      <Typography variant="body1">or</Typography>
      <Link component="button" onClick={onClick}>
        <Typography variant="body1" textAlign="left">
          {saveToEmail
            ? "Save and return to this application later"
            : "Resume an application you have already started"}
        </Typography>
      </Link>
    </InnerContainer>
  );
};

export default SaveResumeButton;
