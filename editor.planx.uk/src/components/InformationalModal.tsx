import IconButton from "@material-ui/core/IconButton";
import { makeStyles } from "@material-ui/core/styles";
import Typography from "@material-ui/core/Typography";
import Close from "@material-ui/icons/Close";
import React from "react";

const useClasses = makeStyles((theme) => ({
  root: {
    background: theme.palette.background.default,
    position: "absolute",
    // TODO: this should be fixed up to not rely on magic header height number
    top: 75,
    left: 0,
    right: 0,
    bottom: 0,
    padding: `${theme.spacing(4)}px ${theme.spacing(3)}px`,
    [theme.breakpoints.up("md")]: {
      padding: `${theme.spacing(6)}px ${theme.spacing(30)}px`,
    },
  },
  content: {
    marginTop: theme.spacing(2),
  },
  close: {
    position: "absolute",
    right: 0,
    top: 0,
  },
}));

function Modal(props: {
  header: string;
  content: string;
  onClose: () => void;
}) {
  const classes = useClasses();
  return (
    <div className={classes.root}>
      <IconButton onClick={props.onClose} className={classes.close}>
        <Close />
      </IconButton>
      <Typography variant="h1">{props.header}</Typography>
      <Typography variant="body2" className={classes.content}>
        {props.content}
      </Typography>
    </div>
  );
}

export default Modal;
