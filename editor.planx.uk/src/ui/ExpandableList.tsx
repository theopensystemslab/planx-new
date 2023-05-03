import MuiButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
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
    borderBottom: "1px solid #B1B4B6",
  },
  title: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: theme.spacing(2, 1, 2, 0),
    width: "100%",
  },
  expanded: {},
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
        <Typography variant="h5" component="h2" id={props.headingId}>
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
