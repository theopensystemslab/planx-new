import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import KeyboardArrowDown from "@material-ui/icons/KeyboardArrowDown";
import KeyboardArrowUp from "@material-ui/icons/KeyboardArrowUp";
import React, { ReactNode } from "react";

const useListClasses = makeStyles(() => ({
  root: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
}));

const useItemClasses = makeStyles(() => ({
  title: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    padding: "12px 0",
    "& > * + *": {
      marginLeft: 10,
    },
    cursor: "pointer",
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
}): FCReturn {
  const classes = useItemClasses();

  return (
    <li>
      <div
        className={classes.title}
        onClick={() => {
          props.onToggle && props.onToggle();
        }}
      >
        {props.expanded ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
        <Typography variant="body2">{props.title}</Typography>
      </div>
      {props.expanded && props.children}
    </li>
  );
}
