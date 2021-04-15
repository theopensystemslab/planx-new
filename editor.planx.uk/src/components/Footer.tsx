import { FeedbackFish } from "@feedback-fish/react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import classnames from "classnames";
import React from "react";
import { Link } from "react-navi";

const useClasses = makeStyles((theme) => ({
  root: {
    backgroundColor: "#fff",
    padding: `${theme.spacing(1.5)}px 0`,
    display: "flex",
    flex: "0 0 auto",
    justifyContent: "space-between",
  },
  link: {
    cursor: "pointer",
    textDecoration: "none",
    color: "inherit",
    "&:hover": {
      textDecoration: "underline",
    },
    padding: `0 ${theme.spacing(3)}px`,
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

interface Props {
  leftItems?: Array<Item | undefined>;
  rightItems?: Array<Item | undefined>;
}

export default function Footer(props: Props) {
  const { leftItems, rightItems } = props;
  const classes = useClasses();

  const feedbackFishId = process.env.REACT_APP_FEEDBACK_FISH_ID;

  return (
    <footer className={classes.root}>
      <Box display="flex">
        {leftItems &&
          leftItems.map((item, i) => item && <FooterItem {...item} key={i} />)}
      </Box>
      <Box display="flex">
        {rightItems &&
          rightItems.map((item, i) => item && <FooterItem {...item} key={i} />)}
        {feedbackFishId && (
          <FeedbackFish projectId={feedbackFishId}>
            <Typography className={classes.link}>Feedback</Typography>
          </FeedbackFish>
        )}
      </Box>
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
      variant="body1"
      className={classnames(classes.link, props.bold && classes.bold)}
    >
      {props.title}
    </Typography>
  );

  return props.href ? (
    <Link href={props.href} prefetch={false} className={classes.link}>
      {title}
    </Link>
  ) : (
    <span onClick={props.onClick}>{title}</span>
  );
}
