import InputBase, { InputBaseProps } from "@material-ui/core/InputBase";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

const useClasses = makeStyles((theme) => ({
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
  input: {
    padding: theme.spacing(1),
  },
  inputMultiline: {
    padding: theme.spacing(1),
    "&$inputRoot": {
      padding: 0,
    },
  },
}));

interface Props extends InputBaseProps {}

export default function InputField(props: Props): FCReturn {
  const classes = useClasses();
  return (
    <InputBase
      classes={{
        root: classes.inputRoot,
        input: classes.input,
        multiline: classes.inputMultiline,
      }}
      {...props}
    />
  );
}
