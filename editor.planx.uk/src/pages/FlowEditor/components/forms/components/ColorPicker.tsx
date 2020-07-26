import ButtonBase from "@material-ui/core/ButtonBase";
import classNames from "classnames";
import React from "react";
import { ChromePicker } from "react-color";
import makeStyles from "@material-ui/core/styles/makeStyles";

const colorPickerStyles = makeStyles((theme) => ({
  root: {
    padding: 0,
  },
  inline: {
    height: 50,
    padding: theme.spacing(2),
    "& $popover": {
      top: "calc(100% - 4px)",
    },
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
  },
  focused: {
    color: theme.palette.primary.dark,
    "& $swatch": {
      boxShadow: `inset 0 0 0 2px ${theme.palette.primary.light}`,
    },
  },
}));

const ColorPicker = ({ inline, color, changeColor }) => {
  const classes = colorPickerStyles();
  const [state, setState] = React.useState({
    displayColorPicker: false,
    color: color || "#f00",
  });
  React.useEffect(() => {
    setState((state) => ({ ...state, color }));
  }, [color]);
  const handleClick = () => {
    setState({
      ...state,
      displayColorPicker: !state.displayColorPicker,
    });
  };

  const handleClose = () => {
    setState({ ...state, displayColorPicker: false });
  };

  const handleChange = (color) => {
    setState((state) => ({ ...state, color: color.hex }));
    changeColor(color.hex);
  };
  return (
    <div className={classNames(classes.root, inline && classes.inline)}>
      <ButtonBase
        classes={{
          root: classNames(
            classes.button,
            state.displayColorPicker && classes.focused
          ),
          focusVisible: classes.focused,
        }}
        onClick={handleClick}
        disableRipple
      >
        <div
          className={classes.swatch}
          style={{
            backgroundColor: state.color,
          }}
        />
        {state.color || "Select a colour"}
      </ButtonBase>
      {state.displayColorPicker ? (
        <div className={classes.popover}>
          <div className={classes.cover} onClick={handleClose} />
          <ChromePicker color={state.color} onChange={handleChange} />
        </div>
      ) : null}
    </div>
  );
};

export default ColorPicker;
