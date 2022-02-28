import { FeedbackFish } from "@feedback-fish/react";
import Box from "@material-ui/core/Box";
import { makeStyles, Theme, useTheme } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";

const useClasses = makeStyles((theme: Theme) => ({
  root: {
    cursor: "pointer",
    "&:hover": {
      "& span": {
        textDecoration: "underline",
      },
    },
    [theme.breakpoints.up("sm")]: {
      padding: `${theme.spacing(1)}px ${theme.spacing(2)}px`,
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
  const theme = useTheme();
  const feedbackFishId = process.env.REACT_APP_FEEDBACK_FISH_ID || "";

  return (
    <FeedbackFish projectId={feedbackFishId}>
      <Box
        role="button"
        tabIndex={0}
        aria-label="This is a new service. Click here to provide feedback."
        className={classes.root}
        bgcolor="background.default"
        display="flex"
        alignItems="center"
        borderBottom={`1px solid ${theme.palette.grey[300]}`}
        px={2}
        py={1}
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
          PRIVATE BETA
        </Box>
        <Typography variant="body2" color="textPrimary">
          This is a new service. Your <span>feedback</span> will help us improve
          it.
        </Typography>
      </Box>
    </FeedbackFish>
  );
}
