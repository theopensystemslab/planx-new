import { FeedbackFish } from "@feedback-fish/react";
import Box from "@material-ui/core/Box";
import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import classnames from "classnames";
import React, { useEffect, useState } from "react";
import { Link } from "react-navi";

const useClasses = makeStyles((theme) => ({
  root: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.black,
    padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
  },
  link: {
    textTransform: "capitalize",
    color: "inherit",
    whiteSpace: "nowrap",
    textDecoration: "underline",
    marginRight: theme.spacing(3),
    "&:hover": {
      textDecoration: "none",
    },
  },
  bold: {
    fontWeight: 800,
  },
  // Style taken from FeedbackFish component
  visibleDisclaimer: {
    position: "absolute",
    transform: "translate3d(-24px, -230px, 0px)",
    width: "320px",
    borderRadius: "16px 16px 0 0",
    backgroundColor: "white",
    zIndex: 1000000,
    "& p": {
      textAlign: "center",
      fontSize: "10px",
      backgroundColor: theme.palette.primary.light,
      borderRadius: "16px 16px 0 0",
      padding: "7px",
      marginTop: 0,
    },
  },
  hiddenDisclaimer: {
    display: "none",
  },
}));

interface Item {
  title: string;
  href?: string;
  onClick?: () => void;
  bold?: boolean;
}

export interface FooterProps {
  items?: Item[];
  children?: React.ReactNode;
}

interface FeedbackDisclaimerProps {
  isVisible: boolean;
}

const FeedbackDisclaimer = ({ isVisible }: FeedbackDisclaimerProps) => {
  const classes = useClasses();
  return (
    <div
      className={
        isVisible ? classes.visibleDisclaimer : classes.hiddenDisclaimer
      }
      data-testid="feedback-disclaimer"
    >
      <p>Please do not include any personal or financial information</p>
    </div>
  );
};

export default function Footer(props: FooterProps) {
  const { items, children } = props;
  const classes = useClasses();
  const feedbackFishId = process.env.REACT_APP_FEEDBACK_FISH_ID;
  const [isFeedbackFishOpen, setIsFeedbackFishOpen] = useState(false);
  const [intervalID, setIntervalID] = useState<number>();
  const toggleFeedbackFish = () => setIsFeedbackFishOpen(!isFeedbackFishOpen);

  // When the FeedbackFish dialog is open, we cannot observe its DOM as it is within a cross-domain iFrame
  // Create an interval to check the visibility periodically, and clear the interval when the dialog closes
  useEffect(
    () => (isFeedbackFishOpen ? createInterval() : destroyInterval()),
    [isFeedbackFishOpen]
  );

  const createInterval = () => {
    const interval = window.setInterval(() => {
      const isIframeVisible =
        document.querySelector("iframe")?.style.display === "none";
      if (isFeedbackFishOpen && isIframeVisible) {
        toggleFeedbackFish();
      }
    }, 100);
    setIntervalID(interval);
  };

  const destroyInterval = () => {
    clearInterval(intervalID);
    setIntervalID(undefined);
  };

  return (
    <footer className={classes.root} data-testid="footer">
      <Box
        display="flex"
        flexWrap="wrap"
        flexDirection={{ xs: "column", md: "row" }}
      >
        {items
          ?.filter((item) => item.title)
          .map((item) => (
            <FooterItem {...item} key={item.title} />
          ))}
        <FeedbackDisclaimer isVisible={isFeedbackFishOpen}></FeedbackDisclaimer>
        {feedbackFishId && (
          <FeedbackFish projectId={feedbackFishId}>
            <ButtonBase onClick={() => toggleFeedbackFish()}>
              <Typography variant="body2" className={classes.link}>
                Feedback
              </Typography>
            </ButtonBase>
          </FeedbackFish>
        )}
      </Box>
      <Box py={4}>{children}</Box>
    </footer>
  );
}

function FooterItem(props: {
  title: string;
  href?: string;
  onClick?: () => void;
  bold?: boolean;
}) {
  const classes = useClasses();

  const title = (
    <Typography
      variant="body2"
      className={classnames(classes.link, props.bold && classes.bold)}
    >
      {props.title.toLowerCase()}
    </Typography>
  );

  return props.href ? (
    <Link href={props.href} prefetch={false} className={classes.link}>
      {title}
    </Link>
  ) : (
    <ButtonBase onClick={props.onClick} className={classes.link}>
      {title}
    </ButtonBase>
  );
}
