import InputBase, { InputBaseProps } from "@material-ui/core/InputBase";
import type { Theme } from "@material-ui/core/styles";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React, { ChangeEvent, forwardRef } from "react";
import { borderedFocusStyle, focusStyle } from "theme";

import ErrorWrapper from "./ErrorWrapper";

export interface Props extends InputBaseProps {
  format?: "large" | "bold" | "data";
  classes?: any;
  className?: string;
  grow?: boolean;
  large?: boolean;
  bordered?: boolean;
  errorMessage?: string;
  onChange?: (ev: ChangeEvent<HTMLInputElement>) => void;
}

export const useClasses = makeStyles<Theme, Props>((theme) => ({
  input: {
    backgroundColor: "#fff",
    fontSize: 15,
    width: "100%",
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
  focused: (props) => (props.bordered ? borderedFocusStyle : focusStyle),
}));

export default forwardRef(
  (props: Props, ref): FCReturn => {
    const classes = useClasses(props);

    const {
      format,
      bordered,
      errorMessage,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescribedBy,
      id,
      ...restProps
    } = props;

    return (
      <ErrorWrapper error={errorMessage}>
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
          inputProps={{
            "aria-label": ariaLabel,
            "aria-describedby": ariaDescribedBy,
          }}
          id={id}
          {...restProps}
        />
      </ErrorWrapper>
    );
  }
);
