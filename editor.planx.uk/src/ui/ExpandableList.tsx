import MuiButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import classnames from "classnames";
import React, { ReactNode } from "react";

import Caret from "./icons/Caret";

const useListClasses = makeStyles((theme) => ({
  root: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
}));

const useItemClasses = makeStyles((theme) => ({
  root: {
    padding: `${theme.spacing(1)}px ${theme.spacing(1.5)}px`,
  },
  title: {
    alignItems: "flex-start",
    display: "flex",
    justifyContent: "space-between",
    width: "100%",
  },
  expanded: {
    background: theme.palette.action.selected,
  },
}));

export function ExpandableList(props: { children: ReactNode }): FCReturn {
  const classes = useListClasses();
  return <ul className={classes.root}>{props.children}</ul>;
}

export function ExpandableListItem(props: {
  title: string;
  expanded?: boolean;
  onToggle?: () => void;
  children?: ReactNode;
  headingId: string;
  groupId: string;
}): FCReturn {
  const classes = useItemClasses();

  const handleToggle = () => {
    props.onToggle && props.onToggle();
  };

  return (
    <li
      className={classnames(classes.root, props.expanded && classes.expanded)}
    >
      <MuiButtonBase
        aria-controls={props.groupId}
        aria-expanded={props.expanded}
        className={classes.title}
        disableRipple
        onClick={handleToggle}
      >
        <Typography variant="h6" component="h2" id={props.headingId}>
          {props.title}
        </Typography>
        <Caret
          expanded={props.expanded}
          titleAccess={props.expanded ? "Less Information" : "More Information"}
        />
      </MuiButtonBase>
      {props.expanded && props.children}
    </li>
  );
}
