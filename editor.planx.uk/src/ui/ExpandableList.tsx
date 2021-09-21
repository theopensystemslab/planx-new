import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import { ENTER, SPACE_BAR } from "@planx/components/shared/constants";
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
    cursor: "pointer",
    "&:focus-visible": {
      outline: `2px solid ${theme.palette.secondary.dark}`,
    },
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

  const handleToggle = () => {
    props.onToggle && props.onToggle();
  };

  return (
    <li
      className={classnames(classes.root, props.expanded && classes.expanded)}
    >
      <Box
        aria-expanded={props.expanded ? "true" : "false"}
        display="flex"
        alignItems="flex-start"
        justifyContent="space-between"
        className={classes.title}
        onClick={handleToggle}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === SPACE_BAR || e.key === ENTER) {
            handleToggle();
          }
        }}
      >
        <Typography variant="h6" component="h2">
          {props.title}
        </Typography>
        <Caret expanded={props.expanded} />
      </Box>
      {props.expanded && props.children}
    </li>
  );
}
