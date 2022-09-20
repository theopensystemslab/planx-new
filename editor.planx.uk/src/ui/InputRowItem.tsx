import Box from "@mui/material/Box";
import makeStyles from "@mui/styles/makeStyles";
import classNames from "classnames";
import React from "react";

interface Props {
  width?: number | string;
  children: JSX.Element[] | JSX.Element;
}

export const useClasses = makeStyles((theme) => ({
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
  const classes = useClasses();
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
