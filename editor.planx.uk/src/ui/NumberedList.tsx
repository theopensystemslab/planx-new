import Box from "@mui/material/Box";
import ButtonBase from "@mui/material/ButtonBase";
import Collapse from "@mui/material/Collapse";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import classNames from "classnames";
import React from "react";
import { FONT_WEIGHT_SEMI_BOLD } from "theme";
import Caret from "ui/icons/Caret";
import ReactMarkdownOrHtml from "ui/ReactMarkdownOrHtml";

const STEP_DIAMETER = "45px";
const STEP_SPACER = "60px";

const useClasses = makeStyles((theme) => ({
  panel: {
    backgroundColor: theme.palette.background.default,
    position: "relative",
    "&::after": {
      content: "''",
      position: "absolute",
      width: `calc(100% - ${STEP_SPACER})`,
      height: "1px",
      background: theme.palette.secondary.main,
      bottom: "0",
      left: STEP_SPACER,
    },
  },
  stepIndicator: {
    position: "absolute",
    width: STEP_DIAMETER,
    height: "100%",
    textAlign: "center",
    top: 0,
    left: 0,
    overflow: "hidden",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    pointerEvents: "none",
    "&::after": {
      content: `''`,
      display: "block",
      width: 2,
      backgroundColor: "currentColor",
      height: "100%",
      top: 0,
      position: "absolute",
      left: "50%",
      transform: "translateX(-50%)",
    },
    "& > i": {
      width: STEP_DIAMETER,
      height: STEP_DIAMETER,
      display: "inline-block",
      lineHeight: theme.spacing(4.25),
      border: `2px solid ${theme.palette.text.primary}`,
      backgroundColor: theme.palette.background.default,
      borderRadius: "50%",
      position: "relative",
      fontStyle: "normal",
      textAlign: "center",
      zIndex: 2,
      fontWeight: FONT_WEIGHT_SEMI_BOLD,
    },
  },
  isFirst: {
    "&::after": {
      top: STEP_DIAMETER,
    },
  },
  isLast: {
    "&::after": {
      height: STEP_DIAMETER,
    },
  },
  summary: {
    fontWeight: FONT_WEIGHT_SEMI_BOLD,
    minHeight: STEP_SPACER,
    padding: theme.spacing(2, 1, 2, 0),
    paddingLeft: STEP_SPACER,
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    [theme.breakpoints.up("sm")]: {},
  },
  content: {
    backgroundColor: theme.palette.background.default,
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(3),
    paddingLeft: STEP_SPACER,
    paddingRight: theme.spacing(2),
    display: "block",
    "& p": {
      marginTop: 0,
      "&:last-child": {
        marginBottom: 0,
      },
    },
  },
  numberedList: {
    listStyle: "none",
    margin: 0,
    padding: 0,
  },
}));

type HeadingLevel = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
interface Item {
  title: string;
  description: string;
}

function ListItem(
  props: Item & { index: number; isLast: boolean; heading?: HeadingLevel }
) {
  const [expanded, setExpanded] = React.useState(false);
  const handleChange = () => {
    setExpanded(!expanded);
  };
  const classes = useClasses();
  return (
    <li className={classes.panel}>
      <div
        className={classNames(
          classes.stepIndicator,
          props.index === 0 && classes.isFirst,
          props.isLast && classes.isLast
        )}
      >
        <i>{props.index + 1}</i>
      </div>
      <ButtonBase
        className={classes.summary}
        onClick={handleChange}
        aria-expanded={expanded}
        aria-controls={`group-${props.index}-content`}
        disableRipple
        disableTouchRipple
      >
        <Box>
          <Typography
            variant="h4"
            component={props.heading || "h5"}
            id={`group-${props.index}-heading`}
            align="left"
          >
            {props.title}
          </Typography>
        </Box>
        <Caret
          expanded={expanded}
          titleAccess={expanded ? "Less Information" : "More Information"}
          color="primary"
        />
      </ButtonBase>
      {props.description && (
        <Collapse in={expanded}>
          <Box
            className={classes.content}
            id={`group-${props.index}-content`}
            aria-labelledby={`group-${props.index}-heading`}
          >
            <ReactMarkdownOrHtml source={props.description} />
          </Box>
        </Collapse>
      )}
    </li>
  );
}

function NumberedList(props: { items: Item[]; heading?: HeadingLevel }) {
  const classes = useClasses();

  return (
    <ol className={classes.numberedList}>
      {props.items?.map((item, i) => (
        <ListItem
          {...item}
          key={i}
          index={i}
          isLast={i === props.items.length - 1}
          heading={props.heading}
        />
      ))}
    </ol>
  );
}

export default NumberedList;
