import Box from "@mui/material/Box";
import { styled, Theme } from "@mui/material/styles";
import makeStyles from "@mui/styles/makeStyles";
import React from "react";
import { borderedFocusStyle } from "theme";

interface RootProps {
  color?: string;
}

const Root = styled(Box)<RootProps>(({ theme, color }) => ({
  display: "inline-flex",
  position: "relative",
  width: 32,
  height: 32,
  borderColor: color || theme.palette.text.primary,
  border: "1px solid",
  background: "transparent",
  "&:focus-within": borderedFocusStyle,
}));

const Input = styled("input")(() => ({
  opacity: 0,
  width: 24,
  height: 24,
  cursor: "pointer",
}));

interface IconProps {
  checked: boolean;
  color?: string;
}

const Icon = styled("span")<IconProps>(({ theme, checked, color }) => ({
  display: checked ? "block" : "none",
  content: "''",
  position: "absolute",
  height: 18,
  width: 10,
  borderColor: color || theme.palette.text.primary,
  borderBottom: "2.5px solid",
  borderRight: "2.5px solid",
  left: "50%",
  top: "42%",
  transform: "translate(-50%, -50%) rotate(45deg)",
}));

export interface Props {
  id?: string;
  checked: boolean;
  color?: string;
  onChange: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

// TODO: Check this!
export default function Checkbox(props: Props): FCReturn {
  return (
    <Root onClick={() => props.onChange()}>
      <Input
        defaultChecked={props.checked}
        type="checkbox"
        id={props.id}
        data-testid={props.id}
        onChange={() => props.onChange()}
      />
      <Icon checked={props.checked} />
    </Root>
  );
}
