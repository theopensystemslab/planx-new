import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";
import { borderedFocusStyle } from "theme";

const Root = styled(Box, {
  shouldForwardProp: (prop) => !["disabled"].includes(prop.toString()),
})<BoxProps & { disabled?: boolean }>(({ theme, disabled }) => ({
  display: "inline-flex",
  flexShrink: 0,
  position: "relative",
  width: 40,
  height: 40,
  borderColor: theme.palette.text.primary,
  border: "2px solid",
  backgroundColor: theme.palette.common.white,
  "&:focus-within": borderedFocusStyle,
  ...(disabled && {
    border: `2px solid ${theme.palette.grey[400]}`,
    backgroundColor: theme.palette.grey[400],
  }),
}));

const Input = styled("input")(() => ({
  opacity: 0,
  width: 24,
  height: 24,
  cursor: "pointer",
}));

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  checked: boolean;
  disabled?: boolean;
}

const Icon = styled("span", {
  shouldForwardProp: (prop) =>
    !["checked", "disabled"].includes(prop.toString()),
})<IconProps>(({ theme, checked, disabled }) => ({
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
  ...(disabled && {
    borderBottom: `5px solid white`,
    borderRight: `5px solid white`,
  }),
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
  const handleChange = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    onChange && onChange();
  };

  return (
    <Root onClick={handleChange} disabled={inputProps?.disabled}>
      <Input
        defaultChecked={checked}
        type="checkbox"
        id={id}
        data-testid={id}
        {...inputProps}
      />
      <Icon checked={checked} disabled={inputProps?.disabled} />
    </Root>
  );
}
