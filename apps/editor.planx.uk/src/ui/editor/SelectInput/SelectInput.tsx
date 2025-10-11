import ArrowIcon from "@mui/icons-material/KeyboardArrowDown";
import Select, { selectClasses, SelectProps } from "@mui/material/Select";
import { styled } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import React, { ReactNode } from "react";

import Input from "../../shared/Input/Input";

export type Props = SelectProps & {
  name?: string;
  children?: ReactNode;
  onChange?: SelectProps["onChange"];
  bordered?: boolean;
  visuallyHiddenLabel?: boolean;
};

const PREFIX = "SelectInput";

const classes = {
  rootSelect: `${PREFIX}-rootSelect`,
  icon: `${PREFIX}-icon`,
  menuPaper: `${PREFIX}-menuPaper`,
  inputSelect: `${PREFIX}-inputSelect`,
};

const Root = styled(Select)(({ theme }) => ({
  width: "100%",
  padding: 0,
  height: 50,
  backgroundColor: "#fff",
  [`& .${selectClasses.select}`]: {
    width: "100%",
    padding: theme.spacing(1, 1.5),
  },
  [`&.${classes.rootSelect}`]: {
    paddingRight: theme.spacing(6),
    boxSizing: "border-box",
    backgroundColor: "#fff",
    color: theme.palette.text.primary,
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
  },
  [`&.${classes.icon}`]: {
    right: theme.spacing(1),
    color: "rgba(0,0,0,0.25)",
  },
  [`&.${classes.menuPaper}`]: {
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
  [`&.${classes.inputSelect}`]: {
    backgroundColor: "transparent",
    fontSize: "1rem",
    "&:focus": {
      backgroundColor: "transparent",
    },
  },
}));

export default function SelectInput({
  children,
  value,
  name,
  onChange,
  bordered,
  visuallyHiddenLabel,
  ...props
}: Props): FCReturn {
  return (
    <>
      {visuallyHiddenLabel && (
        <label
          id={`${name?.replaceAll(" ", "-")}-label`}
          style={visuallyHidden}
        >
          {name}
        </label>
      )}
      <Root
        variant="standard"
        value={value}
        labelId={`${name?.replaceAll(" ", "-")}-label`}
        classes={{
          select: classes.rootSelect,
          icon: classes.icon,
        }}
        onChange={onChange}
        IconComponent={ArrowIcon}
        input={<Input bordered={bordered} />}
        inputProps={{
          name,
          classes: {
            select: classes.inputSelect,
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
      </Root>
    </>
  );
}
