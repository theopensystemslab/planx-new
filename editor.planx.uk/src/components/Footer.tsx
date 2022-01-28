import { FeedbackFish } from "@feedback-fish/react";
import Box from "@material-ui/core/Box";
import ButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import classnames from "classnames";
import React, { useEffect, useRef, useState } from "react";
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
  wrapper: {
    position: "absolute",
    transform: "translate3d(-24px, -230px, 0px)",
    width: "320px",
    borderRadius: "16px 16px 0 0",
    backgroundColor: "white",
    // boxShadow: "rgb(0 0 0 / 20%) 0px 18px 50px -10px",
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

const useOutsideAlerter = (
  ref: any,
  isFeedbackFishOpen: boolean,
  setIsFeedbackFishOpen: any
) => {
  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (isFeedbackFishOpen) {
        if (ref.current && !ref.current.contains(event.target)) {
          setIsFeedbackFishOpen(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [ref, isFeedbackFishOpen]);
};

export default function Footer(props: Props) {
  const { items, children } = props;
  const classes = useClasses();
  const [isFeedbackFishOpen, setIsFeedbackFishOpen] = useState(false);
  const wrapperRef = useRef(null);
  useOutsideAlerter(wrapperRef, isFeedbackFishOpen, setIsFeedbackFishOpen);
  const feedbackFishId = process.env.REACT_APP_FEEDBACK_FISH_ID;
  const iframe = document.getElementsByTagName("iframe")[0];

  // useEffect(() => {
  //   const isOpen = iframe?.style?.display === "block";
  //   console.log(isOpen)
  //   if (isOpen) setIsFeedbackFishOpen(!isFeedbackFishOpen)
  // }, [iframe?.style?.display]);

  // const toggleFeedbackFish = () => {
  //   ;
  //   const iframe = ;
  //   isFeedbackFishOpen ? iframe.style.display = "block" : iframe.style.display === "none";
  // }

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
        {isFeedbackFishOpen && (
          <div className={classes.wrapper}>
            <p>Please do not include any personal or financial information</p>
          </div>
        )}
        {feedbackFishId && (
          <ButtonBase
            // onClick={() => toggleFeedbackFish()}
            ref={wrapperRef}
          >
            <FeedbackFish projectId={feedbackFishId}>
              <Typography variant="body2" className={classes.link}>
                Feedback
              </Typography>
            </FeedbackFish>
          </ButtonBase>
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
