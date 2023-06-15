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
    padding: theme.spacing(0, 1.5),
    height: 50,
    backgroundColor: "#fff",
    "& $selectRoot": {
      paddingRight: theme.spacing(6),
    },
  },
  selectRoot: {
    boxSizing: "border-box",
    backgroundColor: "#fff",
    color: theme.palette.text.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  icon: {
    right: theme.spacing(1),
    color: "rgba(0,0,0,0.25)",
  },
  select: {
    backgroundColor: "transparent",
    fontSize: "1rem",
    "&:focus": {
      backgroundColor: "transparent",
    },
  },
  menuPaper: {
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
      classes={{
        select: classes.selectRoot,
        icon: classes.icon,
      }}
      onChange={onChange}
      IconComponent={ArrowIcon}
      input={<Input />}
      inputProps={{
        name,
        classes: {
          select: classes.select,
        },
      }}
      MenuProps={{
        anchorOrigin: {
          vertical: "bottom",
          horizontal: "center",
        },
        classes: {
          paper: classes.menuPaper,
        },
      }}
      {...props}
    >
      {children}
    </Select>
  );
}
