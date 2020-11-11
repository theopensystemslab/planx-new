import InputBase, { InputBaseProps } from "@material-ui/core/InputBase";
import makeStyles from "@material-ui/core/styles/makeStyles";
import classNames from "classnames";
import React, { ChangeEvent } from "react";

interface Props extends InputBaseProps {
  format?: "large" | "bold" | "data";
  classes?: any;
  className?: string;
  grow?: boolean;
  large?: boolean;
  bordered?: boolean;
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
}

export const inputStyles = makeStyles((theme) => ({
  input: {
    backgroundColor: "#fff",
    fontSize: 15,
    padding: theme.spacing(0, 1.5),
    height: 50,
    "& input": {
      fontWeight: "inherit",
    },
  },
  bordered: {
    border: `2px solid #000`,
  },
  inputMultiline: {
    height: "auto",
    "& textarea": {
      padding: theme.spacing(1.5, 0),
      lineHeight: 1.6,
    },
  },
  questionInput: {
    backgroundColor: "#fff",
    height: 50,
    fontSize: 25,
    width: "100%",
    fontWeight: 700,
  },
  bold: {
    fontWeight: 700,
  },
  data: {
    backgroundColor: "#fafafa",
  },
  adornedEnd: {
    paddingRight: 2,
  },
  focused: {
    boxShadow: `inset 0 0 0 2px ${theme.palette.primary.light}`,
  },
}));

const Input: React.FC<Props> = (props) => {
  const classes = inputStyles();

  const { format, bordered, ...restProps } = props;

  return (
    <InputBase
      className={classNames(
        classes.input,
        format === "large" && classes.questionInput,
        format === "bold" && classes.bold,
        format === "data" && classes.data,
        bordered && classes.bordered
      )}
      classes={{
        multiline: classes.inputMultiline,
        adornedEnd: classes.adornedEnd,
        focused: classes.focused,
      }}
      {...restProps}
    />
  );
};
export default Input;
