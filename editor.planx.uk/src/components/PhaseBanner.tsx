import { FeedbackFish } from "@feedback-fish/react";
import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Link from "@mui/material/Link";
import { Theme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import { getFeedbackMetadata } from "lib/feedback";
import React, { useEffect, useState } from "react";

const useClasses = makeStyles((theme: Theme) => ({
  root: {
    backgroundColor: "white",
    display: "flex",
    justifyContent: "start",
    [theme.breakpoints.up("sm")]: {
      padding: theme.spacing(1, 2),
    },
  },
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
  const classes = useClasses();
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
      <ButtonBase
        aria-label="This is a new service. Click here to provide feedback."
        className={classes.root}
      >
        <Box
          bgcolor="primary.main"
          color="white"
          display="flex"
          alignItems="center"
          flexBasis={0}
          px={2}
          mr={2}
          py={0.5}
          fontSize={15}
          textAlign="center"
          whiteSpace="nowrap"
          fontWeight={600}
          className={classes.betaIcon}
        >
          TEST TEST
        </Box>
        <Typography variant="body2" color="textPrimary">
          This is a new service. Your <Link>feedback</Link> will help us improve
          it.
        </Typography>
      </ButtonBase>
    </FeedbackFish>
  );
}
