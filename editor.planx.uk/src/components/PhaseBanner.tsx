import { Span } from "@airbrake/browser/dist/metrics";
import { FeedbackFish } from "@feedback-fish/react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { getFeedbackMetadata } from "lib/feedback";
import React, { useEffect, useState } from "react";

const Root = styled(ButtonBase)(({ theme }) => ({
  width: "100%",
  border: `solid ${theme.palette.grey[400]}`,
  borderWidth: "1px 0",
  backgroundColor: "white",
  display: "flex",
  justifyContent: "start",
  alignItems: "start",
  padding: theme.spacing(1, 2),
  [theme.breakpoints.up("md")]: {
    padding: theme.spacing(1, 3),
  },
  [theme.breakpoints.up("lg")]: {
    padding: theme.spacing(1, 4),
  },
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
      <Root aria-label="This is a new service. Click here to provide feedback.">
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
          This is a new service. Your <Link>feedback</Link> will help us improve
          it.
        </Typography>
      </Root>
    </FeedbackFish>
  );
}
