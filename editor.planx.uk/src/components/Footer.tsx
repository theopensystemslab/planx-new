import { FeedbackFish } from "@feedback-fish/react";
import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import React, { useState } from "react";
import { Link } from "react-navi";

import Modal from "./InformationalModal";

const useClasses = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.default,
    padding: `${theme.spacing(3)}px 0`,
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

  // TODO: replace with actual routing
  const [openModal, setOpenModal] = useState(false);

  const feedbackFishId = process.env.REACT_APP_FEEDBACK_FISH_ID;

  return (
    <footer className={classes.root}>
      {leftItems.map((item, i) => (
        <FooterItem
          {...item}
          key={i}
          onClick={() => setOpenModal(!openModal)}
        />
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

      {/* TODO: this shouldn't be here; will be routed properly */}
      {openModal && (
        <Modal
          header={"Privacy Notice"}
          content="Important things to know about the spies who are watching and recording you at all times"
          onClose={() => setOpenModal(false)}
        />
      )}
    </footer>
  );
}

function FooterItem(props: {
  title: string;
  href: string;
  bold?: boolean;
  onClick?: () => void;
}) {
  const classes = useClasses();

  return (
    <div className={classes.link} onClick={props.onClick}>
      <Typography variant="body1" className={props.bold ? classes.bold : ""}>
        {props.title}
      </Typography>
    </div>
  );
}
