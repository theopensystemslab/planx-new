import { FeedbackFish } from "@feedback-fish/react";
import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
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
}));

interface Item {
  title: string;
  href?: string;
  onClick?: () => void;
  bold?: boolean;
}

export interface Props {
  items?: Item[];
  children?: React.ReactNode;
}

export default function Footer(props: Props) {
  const { items, children } = props;
  const classes = useClasses();
  const [feedbackPrivacyNoteVisible, setFeedbackPrivacyNoteVisible] =
    useState(false);

  useEffect(() => {
    let feedbackFishPostMessageWorkingCorrectly: boolean;
    const handleMessage = (event: MessageEvent) => {
      try {
        // the feedback fish widget posts a message that's either
        // {"width":0,"height":0} if the iframe is hidden
        // or {"width":320,"height":200} if the iframe is visible
        if (event.origin.endsWith("feedback.fish")) {
          const { width, height } = JSON.parse(event.data);
          // XXX: postMessage not working in firefox as expected
          //      https://trello.com/c/MX1cpAM8 this disables it in FF
          //      by checking if the initial {"width":0,"height":0} message
          //      was received. If not then never show feedback warning msg
          if (width === 0 && height === 0) {
            feedbackFishPostMessageWorkingCorrectly = true;
          }
          setFeedbackPrivacyNoteVisible(
            width > 0 && height > 0 && feedbackFishPostMessageWorkingCorrectly
          );
        }
      } catch (err) {}
    };
    window.addEventListener("message", handleMessage);
    return () => {
      window.removeEventListener("message", handleMessage);
    };
  }, []);

  const feedbackFishId = process.env.REACT_APP_FEEDBACK_FISH_ID;

  const handleFeedbackPrivacyNoteClose = (e: React.MouseEvent) => {
    setFeedbackPrivacyNoteVisible(false);
    // prevent click from propagating to feedback fish listener,
    // as it would close the widget otherwise
    e.stopPropagation();
  };

  return (
    <footer className={classes.root}>
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
        {feedbackFishId && (
          <>
            {feedbackPrivacyNoteVisible && (
              <Dialog
                // XXX: only render dialog when visible & open=true by default,
                //      otherwise clicking modal BG also closes feedback widget
                open
                onClose={handleFeedbackPrivacyNoteClose}
                // feedback fish uses z-index of 999999 :(
                style={{ zIndex: 999999 + 1 }}
                onClick={(e) => e.stopPropagation()}
              >
                <DialogContent>
                  Please do not include any personal or financial information in
                  your feedback
                </DialogContent>
                <DialogActions>
                  <Button onClick={handleFeedbackPrivacyNoteClose}>OK</Button>
                </DialogActions>
              </Dialog>
            )}

            <FeedbackFish projectId={feedbackFishId}>
              <ButtonBase>
                <Typography variant="body2" className={classes.link}>
                  Feedback
                </Typography>
              </ButtonBase>
            </FeedbackFish>
          </>
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
