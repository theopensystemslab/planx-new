import { makeStyles } from "@material-ui/core/styles";
import SvgIcon, { SvgIconProps } from "@material-ui/core/SvgIcon";
import classnames from "classnames";
import React from "react";

const useStyles = makeStyles(() => ({
  root: {
    height: 8,
    width: 19,
    transition: "transform 0.25s ease-out",
  },
  expanded: {
    transform: "rotate(180deg)",
  },
}));

export default function Caret({
  expanded,
  ...svgProps
}: SvgIconProps & { expanded?: boolean }) {
  const classes = useStyles();
  return (
    <SvgIcon
      {...svgProps}
      className={classnames(classes.root, {
        [classes.expanded]: expanded,
      })}
      viewBox="0 0 14 8"
    >
      <path d="M1 1L7 7L13 1" stroke="black" fill="none" />
    </SvgIcon>
  );
}
