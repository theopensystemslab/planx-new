import Box from "@material-ui/core/Box";
import { makeStyles, Theme } from "@material-ui/core/styles";
import React from "react";
import { inputFocusStyle } from "theme";

export const useClasses = makeStyles<Theme, Props>((theme) => ({
  box: {
    display: "inline-flex",
    position: "relative",
    width: 32,
    height: 32,
    borderColor: (props) => props.color || theme.palette.text.primary,
    border: "1px solid",
    background: "transparent",
    "&:focus-within": inputFocusStyle(theme.palette.action.focus),
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
    height: 18,
    width: 10,
    borderColor: (props) => props.color || theme.palette.text.primary,
    borderBottom: "2.5px solid",
    borderRight: "2.5px solid",
    left: "50%",
    top: "42%",
    transform: "translate(-50%, -50%) rotate(45deg)",
  },
}));

export interface Props {
  id?: string;
  checked: boolean;
  color?: string;
  onChange: (event?: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

export default function Checkbox(props: Props): FCReturn {
  const classes = useClasses(props);

  return (
    <Box className={classes.box}>
      <input
        defaultChecked={props.checked}
        className={classes.input}
        type="checkbox"
        id={props.id}
        onChange={() => props.onChange()}
      />
      <span className={classes.icon}></span>
    </Box>
  );
}
