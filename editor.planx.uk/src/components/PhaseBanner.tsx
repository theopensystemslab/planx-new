import { Span } from "@airbrake/browser/dist/metrics";
import { FeedbackFish } from "@feedback-fish/react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Container from "@mui/material/Container";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { getFeedbackMetadata } from "lib/feedback";
import React, { useEffect, useState } from "react";

const Root = styled(Box)(({ theme }) => ({
  width: "100%",
  border: `solid ${theme.palette.grey[400]}`,
  borderWidth: "1px 0",
  backgroundColor: "#FFFFFF",
}));

const Inner = styled(ButtonBase)(({ theme }) => ({
  width: "100%",
  display: "flex",
  justifyContent: "start",
  alignItems: "start",
  padding: theme.spacing(1, 0),
}));

const BetaFlag = styled(Box)(({ theme }) => ({
  betaIcon: {
    width: "100%",
    "& > *": {
      width: "100%",
    },
    [theme.breakpoints.up("sm")]: {
      width: "auto",
      marginRight: theme.spacing(2),
    },
  },
}));

export default function PhaseBanner(): FCReturn {
  const feedbackFishId = process.env.REACT_APP_FEEDBACK_FISH_ID || "";
  const [metadata, setMetadata] = useState<Record<string, string>>();

  useEffect(() => {
    const handleMessage = () => setMetadata(getFeedbackMetadata());
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  return (
    <FeedbackFish projectId={feedbackFishId} metadata={metadata}>
      <Root>
        <Container maxWidth="xl">
          <Inner aria-label="This is a new service. Click here to provide feedback.">
            <BetaFlag
              bgcolor="primary.main"
              color="white"
              display="flex"
              alignItems="flex-start"
              flexBasis={0}
              px={1}
              mr={1}
              py={0.5}
              fontSize={14}
              textAlign="center"
              whiteSpace="nowrap"
              fontWeight={600}
            >
              PUBLIC BETA
            </BetaFlag>
            <Typography
              variant="body2"
              fontSize={14}
              color="textPrimary"
              textAlign="left"
              mt="0.25em"
            >
              This is a new service. Your <Link>feedback</Link> will help us
              improve it.
            </Typography>
          </Inner>
        </Container>
      </Root>
    </FeedbackFish>
  );
}
