import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Fade from "@mui/material/Fade";
import { styled, Theme, useTheme } from "@mui/material/styles";
import { ComponentType as TYPES } from "@opensystemslab/planx-core/types";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { ApplicationPath } from "types";

import OrNavigationButton from "./OrNavigationButton";

interface Props {
  children: React.ReactNode;
  isValid?: boolean;
  isTestWarningWrapper?: boolean;
  handleSubmit?: (data?: any) => void;
}

export type OrNavigationType = "save-resume" | "navigate-to-published";

export const contentFlowSpacing = (theme: Theme): React.CSSProperties => ({
  marginTop: theme.spacing(2),
  [theme.breakpoints.up("md")]: {
    marginTop: theme.spacing(2.5),
  },
});

const InnerContainer = styled(Box)(({ theme }) => ({
  maxWidth: "100%",
  position: "relative",
  "& > * + *": {
    ...contentFlowSpacing(theme),
  },
  "& > *": {
    maxWidth: theme.breakpoints.values.formWrap,
    width: "100%",
  },
}));

/**
 * Card which acts as a wrapper for public components
 * @param {object} props Component props
 * @param {bool} props.handleSubmit if included then show the Continue button
 * @param {bool} props.isValid if falsey then disable Continue button, otherwise enable
 * @param {bool} props.isTestWarningWrapper if truthy then show navigate to publish Or button
 */
const Card: React.FC<Props> = ({
  children,
  isValid = true,
  handleSubmit,
  isTestWarningWrapper,
  ...props
}) => {
  const theme = useTheme();
  const [path, visibleNode, breadcrumbs, flow] = useStore((state) => [
    state.path,
    state.currentCard,
    state.breadcrumbs,
    state.flow,
  ]);
  const { track } = useAnalyticsTracking();

  const defineNavigationType = (): OrNavigationType | undefined => {
    // Check if we have a Send node in our breadcrumbs
    //   This is a better/more immediate proxy for "submitted" in the frontend because actual send events that populate lowcal_sessions.submitted_at are queued via Hasura
    const hasSent = Object.keys(breadcrumbs).some(
      (breadcrumbNodeId: string) => flow[breadcrumbNodeId]?.type === TYPES.Send,
    );

    const showSaveResumeButton =
      path === ApplicationPath.SaveAndReturn && handleSubmit && !hasSent;

    if (showSaveResumeButton && !isTestWarningWrapper) {
      return "save-resume";
    }

    if (!showSaveResumeButton && isTestWarningWrapper) {
      return "navigate-to-published";
    }
  };

  useEffect(() => {
    // The Card component is only rendered when there's content the user will see
    if (visibleNode?.id) track(visibleNode?.id);
  }, []);

  const orNavigationType = defineNavigationType();

  return (
    <Fade
      in={true}
      timeout={theme.transitions.duration.enteringScreen}
      mountOnEnter={true}
      unmountOnExit={true}
    >
      <Container maxWidth="contentWrap">
        <InnerContainer
          bgcolor="background.default"
          mt={{ xs: 4, md: 6 }}
          mb={{ xs: 4, md: 8 }}
          {...props}
        >
          {children}

          <Box pt={2}>
            {handleSubmit && (
              <Button
                variant="contained"
                color="prompt"
                size="large"
                type="submit"
                disabled={!isValid}
                onClick={async () => await handleSubmit()}
                data-testid="continue-button"
              >
                Continue
              </Button>
            )}
            {orNavigationType !== undefined && (
              <OrNavigationButton type={orNavigationType} />
            )}
          </Box>
        </InnerContainer>
      </Container>
    </Fade>
  );
};
export default Card;
