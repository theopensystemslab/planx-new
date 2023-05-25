import makeStyles from "@mui/styles/makeStyles";
import classNames from "classnames";
import React from "react";

const useClasses = makeStyles((theme) => ({
  inputRow: {
    display: "flex",
    width: "100%",
    "&:not(:last-child)": {
      marginBottom: 2,
    },
    "& > *": {
      flexGrow: 1,
      marginLeft: 1,
      marginRight: 1,
      "&:first-child": {
        marginLeft: 0,
      },
      "&:last-child": {
        marginRight: 0,
        flexShrink: 0,
      },
    },
  },
  childRow: {
    paddingLeft: 52,
    position: "relative",
  },
  rowIcon: {
    color: theme.palette.text.secondary,
    opacity: 0.5,
    position: "absolute",
    left: 13,
    top: 13,
    "& + *": {
      marginLeft: 0,
    },
  },
}));

interface Props {
  RowIcon?: any;
  childRow?: boolean;
  children: React.ReactNode;
}

export default function InputRow({
  children,
  RowIcon,
  childRow,
}: Props): FCReturn {
  const classes = useClasses();
  return (
    <div
      className={classNames(
        classes.inputRow,
        RowIcon && classes.childRow,
        childRow && classes.childRow
      )}
    >
      {RowIcon && <RowIcon className={classes.rowIcon} />}
      {children}
    </div>
  );
}
