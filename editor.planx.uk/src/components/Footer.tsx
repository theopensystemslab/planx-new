import { FeedbackFish } from "@feedback-fish/react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import classnames from "classnames";
import React from "react";
import { Link } from "react-navi";

const useClasses = makeStyles((theme) => ({
  root: {
    color: theme.palette.common.white,
    backgroundColor: theme.palette.common.black,
    padding: `${theme.spacing(2)}px ${theme.spacing(4)}px`,
  },
  link: {
    cursor: "pointer",
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

  const feedbackFishId = process.env.REACT_APP_FEEDBACK_FISH_ID;

  return (
    <footer className={classes.root}>
      <Box display="flex" flexWrap="wrap">
        {items &&
          items.map((item, i) => item && <FooterItem {...item} key={i} />)}
        {feedbackFishId && (
          <FeedbackFish projectId={feedbackFishId}>
            <Typography variant="body2" className={classes.link}>
              Feedback
            </Typography>
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
