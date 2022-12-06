import MuiButtonBase from "@mui/material/ButtonBase";
import makeStyles from "@mui/styles/makeStyles";
import classNames from "classnames";
import React from "react";

const useStyles = makeStyles((theme) => ({
  root: {
    transition: theme.transitions.create(["background-color", "box-shadow"]),
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
      backgroundColor: theme.palette.grey[800],
      color: "white",
    },
  },
  selected: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
  },
}));

export interface Props {
  selected: boolean;
  children?: React.ReactNode;
  className?: string;
  id?: string;
  onClick: (event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

export default function ButtonBase(props: Props): FCReturn {
  const { selected, onClick, children, className, id } = props;
  const classes = useStyles();

  return (
    <MuiButtonBase
      href=""
      className={classNames(
        classes.root,
        selected && classes.selected,
        className
      )}
      onClick={onClick}
      id={id}
    >
      {children}
    </MuiButtonBase>
  );
}
