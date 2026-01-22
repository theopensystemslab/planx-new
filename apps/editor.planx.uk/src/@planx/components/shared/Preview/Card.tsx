import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Fade from "@mui/material/Fade";
import { styled, SxProps, Theme, useTheme } from "@mui/material/styles";
import { useAnalyticsTracking } from "pages/FlowEditor/lib/analytics/provider";
import { useStore } from "pages/FlowEditor/lib/store";
import React, { useEffect } from "react";

import InternalBackButton from "./InternalBackButton";
import OrNavigationButton from "./OrNavigationButton";

interface Props {
  children: React.ReactNode;
  /**
   * If falsey then disable Continue button, otherwise enable
   */
  isValid?: boolean;
  /**
   * If included then show the Continue button
   */
  handleSubmit?: (data?: any) => void;
  sx?: SxProps<Theme>;
  handleBack?: () => void;
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
 */
const Card: React.FC<Props> = ({
  children,
  isValid = true,
  handleSubmit,
  sx,
  handleBack,
  ...props
}) => {
  const theme = useTheme();
  const [visibleNode] = useStore((state) => [state.currentCard]);
  const { track } = useAnalyticsTracking();

  useEffect(() => {
    // The Card component is only rendered when there's content the user will see
    if (visibleNode?.id) track(visibleNode?.id);
  }, []);

  return (
    <>
      {handleBack && <InternalBackButton handleBack={handleBack} />}
      <Fade
        in={true}
        timeout={theme.transitions.duration.enteringScreen}
        mountOnEnter={true}
        unmountOnExit={true}
      >
        <Container maxWidth="contentWrap" sx={sx}>
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
              <OrNavigationButton handleSubmit={handleSubmit} />
            </Box>
          </InnerContainer>
        </Container>
      </Fade>
    </>
  );
};
export default Card;
