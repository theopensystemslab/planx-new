import Select, { SelectProps } from "@material-ui/core/Select";
import { makeStyles } from "@material-ui/core/styles";
import ArrowIcon from "@material-ui/icons/KeyboardArrowDown";
import React from "react";

import Input from "./Input";

export interface Props extends SelectProps {
  name?: string;
  children?;
  onChange?;
}

const selectInputStyles = makeStyles((theme) => ({
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
    color: theme.palette.text.secondary,
    paddingLeft: theme.spacing(1.5),
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  icon: {
    right: theme.spacing(1.5),
    color: "rgba(0,0,0,0.25)",
  },
  selectMenu: {
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
  const classes = selectInputStyles();
  return (
    <Select
      value={value}
      className={classes.root}
      classes={{
        root: classes.selectRoot,
        icon: classes.icon,
      }}
      onChange={onChange}
      IconComponent={ArrowIcon}
      input={<Input />}
      inputProps={{
        name,
        classes: {
          selectMenu: classes.selectMenu,
        },
      }}
      MenuProps={{
        getContentAnchorEl: null,
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
