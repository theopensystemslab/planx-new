import { FeedbackFish } from "@feedback-fish/react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
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
  href: string;
  bold?: boolean;
  onClick?: () => void;
}

interface Props {
  leftItems: Item[];
  rightItems: Item[];
}

export default function Footer(props: Props) {
  const { leftItems, rightItems } = props;
  const classes = useClasses();

  const feedbackFishId = process.env.REACT_APP_FEEDBACK_FISH_ID;

  return (
    <footer className={classes.root}>
      {leftItems.map((item, i) => (
        <FooterItem {...item} key={i} />
      ))}
      <Box display="flex">
        {rightItems.map((item, i) => (
          <FooterItem {...item} key={i} />
        ))}
        {feedbackFishId && (
          <FeedbackFish projectId={feedbackFishId}>
            <Typography className={classes.link}>Feedback</Typography>
          </FeedbackFish>
        )}
      </Box>
    </footer>
  );
}

function FooterItem(props: { title: string; href: string; bold?: boolean }) {
  const classes = useClasses();

  return (
    <Link href={props.href} prefetch={false}>
      <div className={classes.link}>
        <Typography variant="body1" className={props.bold ? classes.bold : ""}>
          {props.title}
        </Typography>
      </div>
    </Link>
  );
}
