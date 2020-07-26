import Box from "@material-ui/core/Box";
import classNames from "classnames";
import React from "react";
import { makeStyles } from "@material-ui/core/styles";

export const inputRowItemStyles = makeStyles((theme) => ({
  inputRowItem: {
    "& > *": {
      width: "100%",
    },
  },
  fixWidth: {
    "&$inputRowItem": {
      flexGrow: 0,
      flexShrink: 0,
    },
  },
}));

interface IInputRowItem {
  width?: number | string;
  children: JSX.Element[] | JSX.Element;
}

const InputRowItem: React.FC<IInputRowItem> = ({
  width,
  children,
  ...props
}) => {
  const classes = inputRowItemStyles();
  return (
    <Box
      className={classNames(classes.inputRowItem, width && classes.fixWidth)}
      maxWidth={width ? width : "none"}
      flexBasis={width ? width : "auto"}
      {...props}
    >
      {children}
    </Box>
  );
};

export default InputRowItem;
