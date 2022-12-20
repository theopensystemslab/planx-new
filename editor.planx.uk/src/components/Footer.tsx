import { FeedbackFish } from "@feedback-fish/react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Link from "@mui/material/Link";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { getFeedbackMetadata } from "lib/feedback";
import React, { useEffect, useState } from "react";
import { Link as ReactNaviLink } from "react-navi";

const Root = styled("footer")(({ theme }) => ({
  color: theme.palette.common.white,
  backgroundColor: theme.palette.common.black,
  padding: theme.spacing(2, 4),
}));

const ButtonGroup = styled(Box)(({ theme }) => ({
  columnGap: theme.spacing(3),
  textTransform: "capitalize",
  display: "flex",
  flexWrap: "wrap",
  [theme.breakpoints.up("xs")]: {
    flexDirection: "column",
  },
  [theme.breakpoints.up("md")]: {
    flexDirection: "row",
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

  const metadata = getFeedbackMetadata();

  return (
    <Root>
      <ButtonGroup>
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
            <FeedbackFish projectId={feedbackFishId} metadata={metadata}>
              <Link color="inherit" component="button">
                <Typography variant="body2">Feedback</Typography>
              </Link>
            </FeedbackFish>
          </>
        )}
      </ButtonGroup>
      <Box py={4}>{children}</Box>
    </Root>
  );
}

function FooterItem(props: {
  title: string;
  href?: string;
  onClick?: () => void;
  bold?: boolean;
}) {
  const title = (
    <Typography
      variant="body2"
      sx={{ fontWeight: props.bold ? 800 : "regular" }}
    >
      {props.title.toLowerCase()}
    </Typography>
  );
  return props.href ? (
    <Link
      color="inherit"
      component={ReactNaviLink}
      href={props.href}
      prefetch={false}
    >
      {title}
    </Link>
  ) : (
    <Link color="inherit" component="button" onClick={props.onClick}>
      {title}
    </Link>
  );
}
