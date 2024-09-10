import Box, { BoxProps } from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import React from "react";
import { borderedFocusStyle } from "theme";

const Root = styled(Box, {
  shouldForwardProp: (prop) =>
    !["disabled", "compact"].includes(prop.toString()),
})<BoxProps & { disabled?: boolean; compact?: boolean }>(
  ({ theme, disabled, compact }) => ({
    display: "inline-flex",
    flexShrink: 0,
    position: "relative",
    width: compact ? 24 : 40,
    height: compact ? 24 : 40,
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

const Input = styled("input")<{ compact?: boolean }>(({ compact }) => ({
  opacity: 0,
  width: compact ? 16 : 24,
  height: compact ? 16 : 24,
  cursor: "pointer",
}));

interface IconProps extends React.HTMLAttributes<HTMLSpanElement> {
  checked: boolean;
  disabled?: boolean;
  compact?: boolean;
}

const Icon = styled("span", {
  shouldForwardProp: (prop) =>
    !["checked", "disabled", "compact"].includes(prop.toString()),
})<IconProps>(({ theme, checked, disabled, compact }) => ({
  display: checked ? "block" : "none",
  content: "''",
  position: "absolute",
  height: compact ? 12 : 24,
  width: compact ? 7 : 12,
  borderBottom: compact ? "3px solid" : "5px solid",
  borderRight: compact ? "3px solid" : "5px solid",
  left: "50%",
  top: "42%",
  transform: "translate(-50%, -50%) rotate(45deg)",
  cursor: "pointer",
  ...(disabled && {
    borderBottom: compact ? "3px solid" : "5px solid",
    borderRight: compact ? "3px solid" : "5px solid",
    borderColor: theme.palette.common.white,
  }),
}));

export interface Props {
  id?: string;
  checked: boolean;
  onChange?: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  compact?: boolean;
}

export default function Checkbox({
  id,
  checked,
  onChange,
  inputProps,
  compact,
}: Props): FCReturn {
  const handleChange = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
    e.preventDefault();
    onChange && onChange();
  };

  return (
    <Root
      onClick={handleChange}
      disabled={inputProps?.disabled}
      compact={compact}
    >
      <Input
        defaultChecked={checked}
        type="checkbox"
        id={id}
        data-testid={id}
        {...inputProps}
        compact={compact}
      />
      <Icon
        checked={checked}
        disabled={inputProps?.disabled}
        compact={compact}
      />
    </Root>
  );
}
