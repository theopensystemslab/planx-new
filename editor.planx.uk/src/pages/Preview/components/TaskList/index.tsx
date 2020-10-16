import Box from "@material-ui/core/Box";
import Button from "@material-ui/core/Button";
import ButtonBase from "@material-ui/core/ButtonBase";
import Collapse from "@material-ui/core/Collapse";
import makeStyles from "@material-ui/core/styles/makeStyles";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import classNames from "classnames";
import React from "react";
import { Task as ITask } from "../../../FlowEditor/data/types";
import Card from "../shared/Card";

interface Props {
  node: any;
  tasks: Array<ITask>;
  handleSubmit?;
}

const taskStyles = makeStyles((theme) => ({
  taskList: { maxWidth: 768 },
  panel: {
    backgroundColor: theme.palette.background.default,
    position: "relative",
  },
  stepIndicator: {
    position: "absolute",
    width: theme.spacing(7),
    height: "100%",
    textAlign: "center",
    top: 0,
    left: 0,
    paddingTop: theme.spacing(2),
    overflow: "hidden",
    [theme.breakpoints.up("sm")]: {
      paddingTop: theme.spacing(1.25),
      width: theme.spacing(13.5),
      paddingLeft: theme.spacing(5.25),
      textAlign: "left",
    },
    "&::after": {
      content: `''`,
      display: "block",
      width: 1,
      backgroundColor: "currentColor",
      height: "100%",
      top: 0,
      position: "absolute",
      left: "50%",
      [theme.breakpoints.up("sm")]: {
        left: theme.spacing(7.5),
      },
    },
    "& > i": {
      width: theme.spacing(3),
      height: theme.spacing(3),
      display: "inline-block",
      lineHeight: `${theme.spacing(3)}px`,
      border: `1px solid ${theme.palette.text.primary}`,
      backgroundColor: theme.palette.background.default,
      borderRadius: "50%",
      position: "relative",
      fontStyle: "normal",
      textAlign: "center",
      zIndex: 10,
      [theme.breakpoints.up("sm")]: {
        lineHeight: `${theme.spacing(4.5)}px`,
        width: theme.spacing(4.5),
        height: theme.spacing(4.5),
      },
    },
  },
  stepIndicatorExpanded: {
    "& > i": {
      backgroundColor: theme.palette.secondary.main,
      color: theme.palette.secondary.contrastText,
      borderColor: theme.palette.text.primary,
    },
  },
  isFirst: {
    "&::after": {
      top: theme.spacing(4.5),
    },
  },
  isLast: {
    "&::after": {
      height: theme.spacing(4.5),
    },
  },
  summary: {
    fontWeight: 700,
    minHeight: theme.spacing(6),
    padding: theme.spacing(2, 0),
    paddingLeft: theme.spacing(7),
    width: "100%",
    display: "flex",
    justifyContent: "space-between",
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(13.5),
    },
  },
  expandIcon: {
    position: "relative",
    transition: "transform 0.25s ease-out",
    right: theme.spacing(2),
    [theme.breakpoints.up("sm")]: {
      right: theme.spacing(4.5),
    },
    [theme.breakpoints.up("md")]: {
      right: theme.spacing(10),
    },
  },
  iconExpanded: {
    transform: "rotate(180deg)",
  },
  moreBtn: {
    fontSize: theme.typography.pxToRem(18),
    color: (theme.palette.grey as any).main,
    display: "inline-block",
    padding: theme.spacing(1),
    lineHeight: 1,
    verticalAlign: "baseline",
    fontWeight: 400,
    marginLeft: theme.spacing(1),
  },
  content: {
    backgroundColor: theme.palette.background.paper,
    paddingTop: theme.spacing(3),
    paddingBottom: theme.spacing(3),
    paddingLeft: theme.spacing(7),
    paddingRight: theme.spacing(2),
    lineHeight: 1.6,
    display: "block",
    [theme.breakpoints.up("sm")]: {
      paddingLeft: theme.spacing(13.5),
      paddingRight: theme.spacing(13.5),
    },
    "& p": {
      marginTop: 0,
      "&:last-child": {
        marginBottom: 0,
      },
    },
    "& a": {
      color: "#22589e",
      fontWeight: 400,
      textDecoration: "underline",
      "&:hover": {
        textDecoration: "none",
      },
    },
  },
  onFocus: {
    outline: `2px solid ${theme.palette.secondary.light}`,
    zIndex: 10,
  },
}));

const Task = ({ title, description, index, isLast }) => {
  const [expanded, setExpanded] = React.useState(false);
  const handleChange = () => {
    setExpanded(!expanded);
  };
  const classes = taskStyles();
  return (
    <Box className={classes.panel}>
      <div
        className={classNames(
          classes.stepIndicator,
          index === 0 && classes.isFirst,
          isLast && classes.isLast,
          expanded && classes.stepIndicatorExpanded
        )}
      >
        <i>{index + 1}</i>
      </div>
      <ButtonBase
        className={classes.summary}
        classes={{ focusVisible: classes.onFocus }}
        onClick={handleChange}
      >
        <Box fontSize={16} fontWeight={700}>
          {title}
        </Box>
        <ExpandMoreIcon
          className={classNames(
            classes.expandIcon,
            expanded && classes.iconExpanded
          )}
        />
      </ButtonBase>
      {description && (
        <Collapse in={expanded}>
          <Box className={classes.content}>{description}</Box>
        </Collapse>
      )}
    </Box>
  );
};

const TaskList: React.FC<Props> = ({ tasks, handleSubmit, node }) => {
  const classes = taskStyles();
  return (
    <Card>
      <Box className={classes.taskList}>
        {tasks.map((task, index) => (
          <Task
            {...task}
            key={index}
            index={index}
            isLast={index === tasks.length}
          />
        ))}
      </Box>

      <Button
        variant="contained"
        color="primary"
        size="large"
        type="submit"
        onClick={handleSubmit}
      >
        Continue
      </Button>
    </Card>
  );
};

export default TaskList;
