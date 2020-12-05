import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import classnames from "classnames";
import React, { ReactNode } from "react";

import Caret from "./icons/Caret";

const useListClasses = makeStyles(() => ({
  root: {
    listStyle: "none",
    padding: 0,
    margin: 0,
  },
}));

const useItemClasses = makeStyles((theme) => ({
  root: {
    padding: `theme.spacing(1)`,
  },
  title: {
    cursor: "pointer",
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
}): FCReturn {
  const classes = useItemClasses();

  return (
    <li
      className={classnames(classes.root, props.expanded && classes.expanded)}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        pb={2}
        className={classes.title}
        onClick={() => {
          props.onToggle && props.onToggle();
        }}
      >
        <Typography variant="h6">{props.title}</Typography>
        <Caret expanded={props.expanded} />
      </Box>
      {props.expanded && props.children}
    </li>
  );
}
