import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Fade from "@mui/material/Fade";
import { styled, Theme, useTheme } from "@mui/material/styles";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analyticsProvider";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";
import { ApplicationPath } from "types";

import SaveResumeButton from "./SaveResumeButton";

interface Props {
  children: React.ReactNode;
  isValid?: boolean;
  handleSubmit?: (data?: any) => void;
}

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
 */
const Card: React.FC<Props> = ({
  children,
  isValid = true,
  handleSubmit,
  ...props
}) => {
  const theme = useTheme();
  const [path, currentCard] = useStore((state) => [
    state.path,
    state.currentCard,
  ]);
  const showSaveResumeButton =
    path === ApplicationPath.SaveAndReturn && handleSubmit;
  const { track } = useAnalyticsTracking();

  useEffect(() => {
    // The Card component is only rendered when there's content the user will
    // see
    const visibleNode = currentCard();
    if (visibleNode?.id) track(visibleNode?.id);
  }, []);

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
            {showSaveResumeButton && <SaveResumeButton />}
          </Box>
        </InnerContainer>
      </Container>
    </Fade>
  );
};
export default Card;
