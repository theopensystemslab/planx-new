import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Container from "@mui/material/Container";
import Fade from "@mui/material/Fade";
import { styled, useTheme } from "@mui/material/styles";
import { useStore } from "pages/FlowEditor/lib/store";
import React from "react";
import { ApplicationPath } from "types";

import SaveResumeButton from "./SaveResumeButton";

interface Props {
  children: React.ReactNode;
  isValid?: boolean;
  handleSubmit?: (data?: any) => void;
}

const InnerContainer = styled(Box)(({ theme }) => ({
  "& > * + *": {
    marginTop: theme.spacing(2.5),
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
  const path = useStore((state) => state.path);
  const showSaveResumeButton =
    path === ApplicationPath.SaveAndReturn && handleSubmit;

  return (
    <Fade
      in={true}
      timeout={theme.transitions.duration.enteringScreen}
      mountOnEnter={true}
      unmountOnExit={true}
    >
      <Container disableGutters maxWidth="md">
        <InnerContainer
          bgcolor="background.default"
          py={{ xs: 2, md: 4 }}
          px={{ xs: 2, md: 3, lg: 0 }}
          mb={4}
          {...props}
        >
          {children}

          {handleSubmit && (
            <Button
              variant="contained"
              color="primary"
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
        </InnerContainer>
      </Container>
    </Fade>
  );
};
export default Card;
