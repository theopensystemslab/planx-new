import { makeStyles } from "@material-ui/core/styles";
import SvgIcon, { SvgIconProps } from "@material-ui/core/SvgIcon";
import classnames from "classnames";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    width: 15,
    transition: "transform 0.25s ease-out",
  },
  expanded: {
    transform: "rotate(180deg)",
  },
}));

export default function Caret(props: SvgIconProps & { expanded?: boolean }) {
  const classes = useStyles();

  return (
    <SvgIcon
      {...props}
      className={classnames(classes.root, props.expanded && classes.expanded)}
      viewBox="0 0 14 8"
    >
      <path d="M1 1L7 7L13 1" stroke="black" fill="none" />
    </SvgIcon>
  );
}
