import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";
import { borderedFocusStyle } from "theme";

const Root = styled(Box)(({ theme }) => ({
  display: "inline-flex",
  flexShrink: 0,
  position: "relative",
  width: 40,
  height: 40,
  borderColor: theme.palette.text.primary,
  border: "2px solid",
  background: "transparent",
  "&:focus-within": borderedFocusStyle,
}));

const Input = styled("input")(() => ({
  opacity: 0,
  width: 24,
  height: 24,
  cursor: "pointer",
}));

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  checked: boolean;
}

const Icon = styled("span", {
  shouldForwardProp: (prop) => prop !== "checked",
})<IconProps>(({ theme, checked }) => ({
  display: checked ? "block" : "none",
  content: "''",
  position: "absolute",
  height: 24,
  width: 12,
  borderColor: theme.palette.text.primary,
  borderBottom: "5px solid",
  borderRight: "5px solid",
  left: "50%",
  top: "42%",
  transform: "translate(-50%, -50%) rotate(45deg)",
  cursor: "pointer",
}));

export interface Props {
  id?: string;
  checked: boolean;
  onChange?: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
}

export default function Checkbox({
  id,
  checked,
  onChange,
  inputProps,
}: Props): FCReturn {
  return (
    <Root onClick={() => onChange && onChange()}>
      <Input
        defaultChecked={checked}
        type="checkbox"
        id={id}
        data-testid={id}
        onChange={() => onChange && onChange()}
        {...inputProps}
      />
      <Icon checked={checked} />
    </Root>
  );
}
