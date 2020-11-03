import InputBase, { InputBaseProps } from "@material-ui/core/InputBase";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const styles = (theme) =>
  ({
    inputRoot: {
      backgroundColor: theme.palette.grey[100],
      transition: "background-color 0.2s ease-out",
      display: "block",
      width: "100%",
      padding: 0,
      "& + $inputRoot": {
        marginTop: theme.spacing(1),
      },
    },
    inputFocused: {
      backgroundColor: theme.palette.grey[200],
    },
    input: {
      padding: theme.spacing(1),
    },
    inputMultiline: {
      padding: theme.spacing(1),
      "&$inputRoot": {
        padding: 0,
      },
    },
  } as any);

const useStyles = makeStyles(styles) as any;

interface Props extends InputBaseProps {}

const InputField = (props: Props) => {
  const classes = useStyles();
  return (
    <InputBase
      classes={{
        root: classes.inputRoot,
        input: classes.input,
        focused: classes.inputFocused,
        multiline: classes.inputMultiline,
      }}
      {...props}
    />
  );
};

export default InputField;
