import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";
import { borderedFocusStyle } from "theme";

const Root = styled(Box, {
  shouldForwardProp: (prop) =>
    !["disabled", "variant"].includes(prop.toString()),
})<BoxProps & { disabled?: boolean; variant?: "default" | "compact" }>(
  ({ theme, disabled, variant }) => ({
    display: "inline-flex",
    flexShrink: 0,
    position: "relative",
    width: variant === "compact" ? 24 : 40,
    height: variant === "compact" ? 24 : 40,
    borderColor: theme.palette.text.primary,
    border: "2px solid",
    backgroundColor: theme.palette.common.white,
    "&:focus-within": borderedFocusStyle,
    ...(disabled && {
      border: `2px solid ${theme.palette.grey[400]}`,
      backgroundColor: theme.palette.grey[400],
    }),
  }),
);

const Input = styled("input")<{ variant?: "default" | "compact" }>(
  ({ variant }) => ({
    opacity: 0,
    width: variant === "compact" ? 16 : 24,
    height: variant === "compact" ? 16 : 24,
    cursor: "pointer",
  }),
);

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  checked: boolean;
  disabled?: boolean;
  variant?: "default" | "compact";
}

const Icon = styled("span", {
  shouldForwardProp: (prop) =>
    !["checked", "disabled", "variant"].includes(prop.toString()),
})<IconProps>(({ theme, checked, disabled, variant }) => ({
  display: checked ? "block" : "none",
  content: "''",
  position: "absolute",
  height: variant === "compact" ? 12 : 24,
  width: variant === "compact" ? 7 : 12,
  borderBottom: variant === "compact" ? "3px solid" : "5px solid",
  borderRight: variant === "compact" ? "3px solid" : "5px solid",
  left: "50%",
  top: variant === "compact" ? "44%" : "42%",
  transform: "translate(-50%, -50%) rotate(45deg)",
  cursor: "pointer",
  ...(disabled && {
    borderBottom: variant === "compact" ? "3px solid" : "5px solid",
    borderRight: variant === "compact" ? "3px solid" : "5px solid",
    borderColor: theme.palette.common.white,
  }),
}));

export interface Props {
  id?: string;
  checked: boolean;
  onChange?: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  variant?: "default" | "compact";
}

export default function Checkbox({
  id,
  checked,
  onChange,
  inputProps,
  variant = "default",
}: Props): FCReturn {
  const handleChange = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    onChange && onChange();
  };

  return (
    <Root
      onClick={handleChange}
      disabled={inputProps?.disabled}
      variant={variant}
    >
      <Input
        defaultChecked={checked}
        type="checkbox"
        id={id}
        data-testid={id}
        {...inputProps}
        variant={variant}
      />
      <Icon
        checked={checked}
        disabled={inputProps?.disabled}
        variant={variant}
      />
    </Root>
  );
}
