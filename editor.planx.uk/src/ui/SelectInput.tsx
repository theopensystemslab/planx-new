import ArrowIcon from "@mui/icons-material/KeyboardArrowDown";
import Select, { SelectProps } from "@mui/material/Select";
import makeStyles from "@mui/styles/makeStyles";
import React, { ReactNode } from "react";

import Input from "./Input";

export interface Props extends SelectProps {
  name?: string;
  children?: ReactNode;
  onChange?: SelectProps["onChange"];
}

const useClasses = makeStyles((theme) => ({
  root: {
    width: "100%",
    backgroundColor: "#fff",
    "& $selectRoot": {
      paddingRight: theme.spacing(6),
    },
  },
  selectRoot: {
    height: 50,
    boxSizing: "border-box",
    backgroundColor: "#fff",
    color: theme.palette.text.primary,
    paddingLeft: theme.spacing(1.5),
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  icon: {
    right: theme.spacing(1.5),
    color: "rgba(0,0,0,0.25)",
  },
  select: {
    backgroundColor: "transparent",
    "&:focus": {
      backgroundColor: "transparent",
    },
  },
  paper: {
    border: `2px solid ${theme.palette.primary.light}`,
    borderTop: 0,
    marginTop: -2,
    boxShadow: "none",
    backgroundColor: "#fff",
    maxHeight: "30vh",
    borderRadius: 0,
    "& ul": {
      padding: "0",
    },
    "& li": {
      color: "currentColor",
      whiteSpace: "normal",
      backgroundColor: "transparent",
      paddingTop: theme.spacing(1.5),
      paddingBottom: theme.spacing(1.5),
      lineHeight: 1.2,
      height: "auto",
    },
  },
}));

export default function SelectInput({
  children,
  value,
  name,
  onChange,
  ...props
}: Props): FCReturn {
  const classes = useClasses();
  return (
    <Select
      variant="standard"
      value={value}
      className={classes.root}
      // TODO: Check this out!
      classes={{
        select: classes.selectRoot,
        icon: classes.icon,
      }}
      onChange={onChange}
      IconComponent={ArrowIcon}
      input={<Input />}
      // TODO: Check this out
      inputProps={{
        name,
        classes: {
          select: classes.select,
        },
      }}
      // TODO: Check this out
      MenuProps={{
        anchorEl: null,
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "left",
        },
        classes: {
          paper: classes.paper,
        },
      }}
      {...props}
    >
      {children}
    </Select>
  );
}
