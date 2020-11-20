import FormHelperText from "@material-ui/core/FormHelperText";
import InputBase from "@material-ui/core/InputBase";
import { makeStyles } from "@material-ui/core/styles";
import React from "react";

export const useInputStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: "#fff",
    marginBottom: theme.spacing(1),
  },
  input: {
    minHeight: 50,
    boxShadow: `inset 0 0 0 2px ${theme.palette.text.primary}`,
    padding: theme.spacing(0.75, 1),
    boxSizing: "border-box",
    color: "#000",
    "&:focus": {
      outline: `2px solid ${theme.palette.secondary.main}`,
      outlineOffset: 0,
    },
  },
  multiline: {
    padding: 0,
    "& textarea": {
      padding: theme.spacing(2, 1),
    },
  },
}));

export interface IFormInput {
  helperText?: string;
  placeholder?: string;
  name?: string;
  onChange?: any;
  value?: any;
}

const FormInput: React.FC<IFormInput> = ({ helperText, ...props }) => {
  const classes = useInputStyles();
  return (
    <>
      <InputBase
        classes={{
          root: classes.root,
          input: classes.input,
          multiline: classes.multiline,
        }}
        {...props}
        onChange={props.onChange}
      />
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </>
  );
};
export default FormInput;
