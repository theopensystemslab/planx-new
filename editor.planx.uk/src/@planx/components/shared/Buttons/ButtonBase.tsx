import MuiButtonBase from "@material-ui/core/ButtonBase";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    transition: theme.transitions.create(["background-color"]),
    backgroundColor: theme.palette.background.paper,
    fontSize: 15,
    fontFamily: "inherit",
    display: "flex",
    justifyContent: "flex-start",
    alignItems: "center",
    width: "100%",
    textAlign: "left",
    position: "relative",
    height: "100%",
    "&:hover": {
      backgroundColor: theme.palette.grey[300],
    },
  },
  selected: {
    backgroundColor: `${theme.palette.primary.main} !important`,
    color: theme.palette.primary.contrastText,
  },
  onFocus: {
    outline: `2px solid ${theme.palette.secondary.light}`,
  },
}));

export interface Props {
  selected: boolean;
  children?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

export default function ButtonBase(props: Props): FCReturn {
  const { selected, onClick, children } = props;
  const classes = useStyles();

  return (
    <MuiButtonBase
      href=""
      className={classNames(classes.root, selected && classes.selected)}
      classes={{ focusVisible: classes.onFocus }}
      onClick={onClick}
    >
      {children}
    </MuiButtonBase>
  );
}
