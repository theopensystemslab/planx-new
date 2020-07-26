import ButtonBase from "@material-ui/core/ButtonBase";
import makeStyles from "@material-ui/core/styles/makeStyles";
import classNames from "classnames";
import React from "react";

const optionButtonStyles = makeStyles((theme) => ({
  root: {
    height: 50,
    paddingLeft: 50,
    paddingRight: theme.spacing(3),
    fontSize: 15,
    position: "relative",
    fontFamily: "inherit",
    display: "block",
    width: "auto",
    minWidth: 200,
    textAlign: "left",
    "&:hover:not($selected)": {
      backgroundColor: "rgba(0,0,0,0.1)",
    },
    "&::before": {
      content: "''",
      position: "absolute",
      height: 10,
      width: 10,
      left: 20,
      top: 20,
      borderRadius: "50%",
      backgroundColor: theme.palette.grey[500],
    },
  },
  selected: (props: { backgroundColor: "" }) => ({
    backgroundColor: theme.palette.grey[300],
    "&::before": {
      color: "#fff",
      backgroundColor: props.backgroundColor
        ? props.backgroundColor
        : theme.palette.primary.light,
    },
  }),
}));

export default ({ selected, children, color, ...props }) => {
  const colorProps = { backgroundColor: color };
  const classes = optionButtonStyles(colorProps);

  return (
    <ButtonBase
      classes={{
        root: classNames(classes.root, selected && classes.selected),
      }}
      {...props}
    >
      {children}
    </ButtonBase>
  );
};
