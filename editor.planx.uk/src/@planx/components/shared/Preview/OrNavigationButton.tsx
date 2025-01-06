import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ApplicationPath } from "types";

import { contentFlowSpacing } from "./Card";
import NavigateToPublishedButton from "./NavigateToPublishedButton";
import SaveResumeButton from "./SaveResumeButton";

type OrNavigationType = "save-resume" | "navigate-to-published";

export const InnerContainer = styled(Box)(({ theme }) => ({
  "& p": {
    ...contentFlowSpacing(theme),
  },
}));

const BUTTON_COMPONENTS = {
  "save-resume": SaveResumeButton,
  "navigate-to-published": NavigateToPublishedButton,
} as const;

const OrNavigationButton = ({
  handleSubmit,
}: {
  handleSubmit: ((data?: any) => void) | undefined;
}) => {
  const [path, breadcrumbs, flow] = useStore((state) => [
    state.path,
    state.breadcrumbs,
    state.flow,
  ]);

  const endOfUrl = window.location.pathname.split("/").slice(-1)[0];
  const TEST_ENVIRONMENTS = new Set(["preview", "draft"]);

  const isTestEnvironment: boolean = TEST_ENVIRONMENTS.has(endOfUrl);

  const defineNavigationType = (): OrNavigationType | undefined => {
    // Check if we have a Send node in our breadcrumbs
    //   This is a better/more immediate proxy for "submitted" in the frontend because actual send events that populate lowcal_sessions.submitted_at are queued via Hasura
    const hasSent = Object.keys(breadcrumbs).some(
      (breadcrumbNodeId: string) => flow[breadcrumbNodeId]?.type === TYPES.Send,
    );

    const showSaveResumeButton =
      path === ApplicationPath.SaveAndReturn && handleSubmit && !hasSent;

    if (showSaveResumeButton && !isTestEnvironment) {
      return "save-resume";
    }

    if (!showSaveResumeButton && isTestEnvironment) {
      return "navigate-to-published";
    }
  };

  const orNavigationType = defineNavigationType();

  const ButtonComponent =
    orNavigationType && BUTTON_COMPONENTS[orNavigationType];

  return (
    ButtonComponent && (
      <InnerContainer>
        <Typography variant="body1">or</Typography>
        {<ButtonComponent />}
      </InnerContainer>
    )
  );
};

export default OrNavigationButton;
