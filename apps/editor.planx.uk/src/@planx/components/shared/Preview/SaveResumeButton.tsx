import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ApplicationPath } from "types";
const SaveResumeButton: React.FC = () => {
  const saveToEmail = useStore((state) => state.saveToEmail);
  const { trackEvent } = useAnalyticsTracking();

  const handleClick = () => {
    if (saveToEmail) {
      trackEvent({ event: "saveClick", metadata: null });
      trackEvent({
        event: "flowDirectionChange",
        metadata: null,
        flowDirection: "save",
      });
      useStore.setState({ path: ApplicationPath.Save });
    } else {
      useStore.setState({ path: ApplicationPath.Resume });
    }
  };

  return (
    <Link component="button" onClick={handleClick}>
      <Typography variant="body1" textAlign="left">
        {saveToEmail
          ? "Save and return to this form later"
          : "Resume a form you have already started"}
      </Typography>
    </Link>
  );
};

export default SaveResumeButton;
