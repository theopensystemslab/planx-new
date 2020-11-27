import Box from "@material-ui/core/Box";
import { makeStyles } from "@material-ui/core/styles";
import classNames from "classnames";
import React from "react";

interface Props {
  width?: number | string;
  children: JSX.Element[] | JSX.Element;
}

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

export default function InputRowItem({
  width,
  children,
  ...props
}: Props): FCReturn {
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
}
