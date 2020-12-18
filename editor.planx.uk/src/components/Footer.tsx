import { FeedbackFish } from "@feedback-fish/react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React from "react";
import { Link } from "react-navi";

const useClasses = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    padding: `${theme.spacing(1.5)}px 0`,
    display: "flex",
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
}

interface Props {
  leftItems: Item[];
  rightItems: Item[];
}

export default function Footer(props: Props) {
  const { leftItems, rightItems } = props;
  const classes = useClasses();

  return (
    <footer className={classes.root}>
      {leftItems.map((item, i) => (
        <FooterItem {...item} key={i} />
      ))}
      <Box display="flex">
        {rightItems.map((item, i) => (
          <FooterItem {...item} key={i} />
        ))}
        <FeedbackFish projectId="f2b6edaccca43d">
          <Typography className={classes.link}>Feedback</Typography>
        </FeedbackFish>
      </Box>
    </footer>
  );
}

function FooterItem(props: { title: string; href: string; bold?: boolean }) {
  const classes = useClasses();

  return (
    <Link href={props.href} className={classes.link}>
      <Typography variant="body1" className={props.bold && classes.bold}>
        {props.title}
      </Typography>
    </Link>
  );
}
