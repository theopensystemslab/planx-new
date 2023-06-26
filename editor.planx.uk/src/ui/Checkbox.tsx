import Box from "@mui/material/Box";
import { Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { borderedFocusStyle } from "theme";

export const useClasses = makeStyles<Theme, Props>((theme) => ({
  box: {
    display: "inline-flex",
    flexShrink: 0,
    position: "relative",
    width: 40,
    height: 40,
    borderColor: (props) => props.color || theme.palette.text.primary,
    border: "2px solid",
    background: "transparent",
    "&:focus-within": borderedFocusStyle,
  },
  input: {
    opacity: 0,
    width: 24,
    height: 24,
    cursor: "pointer",
  },
  icon: {
    display: (props) => (props.checked ? "block" : "none"),
    content: "''",
    position: "absolute",
    height: 24,
    width: 12,
    borderColor: (props) => props.color || theme.palette.text.primary,
    borderBottom: "5px solid",
    borderRight: "5px solid",
    left: "50%",
    top: "42%",
    transform: "translate(-50%, -50%) rotate(45deg)",
    cursor: "pointer",
  },
}));

export interface Props {
  id?: string;
  checked: boolean;
  color?: string;
  onChange: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export default function Checkbox(props: Props): FCReturn {
  const classes = useClasses(props);

  return (
    <Box className={classes.box} onClick={() => props.onChange()}>
      <input
        defaultChecked={props.checked}
        className={classes.input}
        type="checkbox"
        id={props.id}
        data-testid={props.id}
        onChange={() => props.onChange()}
      />
      <span className={classes.icon}></span>
    </Box>
  );
}
