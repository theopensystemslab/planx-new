import ButtonBase from "@mui/material/ButtonBase";
import Typography from "@mui/material/Typography";
import makeStyles from "@mui/styles/makeStyles";
import classNames from "classnames";
import React, { useState } from "react";
import { ChromePicker } from "react-color";

export interface Props {
  label?: string;
  inline?: boolean;
  color?: string;
  onChange?: (newColor: string) => void;
}

const useClasses = makeStyles((theme) => ({
  root: {
    padding: 0,
    position: "relative",
    display: "flex",
    alignItems: "center",
  },
  inline: {
    height: 50,
    padding: theme.spacing(2, 0),
    "& $popover": {
      top: "calc(100% - 4px)",
    },
  },
  label: {
    marginRight: theme.spacing(2),
  },
  button: {
    fontFamily: "inherit",
    fontSize: 15,
    position: "relative",
    display: "block",
    textAlign: "left",
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(2),
    whiteSpace: "nowrap",
  },
  swatch: {
    background: "#fff",
    display: "inline-block",
    cursor: "pointer",
    position: "absolute",
    top: 0,
    left: 0,
    width: 18,
    height: 18,
  },
  popover: {
    position: "absolute",
    zIndex: 2,
    top: "calc(100% + 12px)",
  },
  cover: {
    position: "fixed",
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    width: "100%",
  },
  focused: {
    color: theme.palette.primary.dark,
    "& $swatch": {
      boxShadow: `inset 0 0 0 2px ${theme.palette.primary.light}`,
    },
  },
}));

export default function ColorPicker(props: Props): FCReturn {
  const classes = useClasses();
  const [show, setShow] = useState(false);

  const handleClick = () => {
    setShow((prevShow) => !prevShow);
  };

  const handleClose = () => {
    setShow(false);
  };

  const handleChange = (newColor: any) => {
    props.onChange && props.onChange(newColor.hex);
  };

  return (
    <div className={classNames(classes.root, props.inline && classes.inline)}>
      <Typography className={classes.label} variant="body2">
        {props.label || "Colour"}:{" "}
      </Typography>
      <ButtonBase
        classes={{
          root: classNames(classes.button, show && classes.focused),
          focusVisible: classes.focused,
        }}
        onClick={handleClick}
        disableRipple
      >
        <div
          className={classes.swatch}
          style={{
            backgroundColor: props.color,
          }}
        />
        {props.color}
      </ButtonBase>
      {show ? (
        <div className={classes.popover}>
          <ButtonBase
            className={classes.cover}
            onClick={handleClose}
            aria-label="Close Colour Picker"
            disableRipple
          />
          <ChromePicker color={props.color} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  );
}
