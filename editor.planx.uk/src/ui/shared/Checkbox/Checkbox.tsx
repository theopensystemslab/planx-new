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
    width: 40,
    height: 40,
    borderColor: theme.palette.text.primary,
    border: "2px solid",
    backgroundColor: theme.palette.common.white,
    "&:focus-within": {
      ...borderedFocusStyle,
      background: "inherit",
    },
    ...(disabled && {
      border: `2px solid ${theme.palette.grey[400]}`,
      backgroundColor: theme.palette.grey[400],
    }),
    ...(variant === "compact" && {
      width: 24,
      height: 24,
    }),
  }),
);

const Input = styled("input")<{ variant?: "default" | "compact" }>(
  ({ variant }) => ({
    opacity: 0,
    width: 24,
    height: 24,
    cursor: "pointer",
    ...(variant === "compact" && {
      width: 16,
      height: 16,
    }),
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
  height: 24,
  width: 12,
  borderBottom: "5px solid",
  borderRight: "5px solid",
  left: "50%",
  top: "42%",
  transform: "translate(-50%, -50%) rotate(45deg)",
  cursor: "pointer",
  ...(variant === "compact" && {
    height: 12,
    width: 7,
    borderBottom: "3px solid",
    borderRight: "3px solid",
    top: "44%",
  }),
  ...(disabled && {
    borderBottom: "5px solid",
    borderRight: "5px solid",
    borderColor: theme.palette.common.white,
    ...(variant === "compact" && {
      borderBottom: "3px solid",
      borderRight: "3px solid",
    }),
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
