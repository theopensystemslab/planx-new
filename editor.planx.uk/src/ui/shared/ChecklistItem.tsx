import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import * as React from "react";

import Checkbox from "./Checkbox";

const Root = styled(Box)(({ theme }) => ({
  width: "100%",
  marginTop: theme.spacing(1),
  marginBottom: theme.spacing(1),
  display: "flex",
  alignItems: "center",
  cursor: "pointer",
}));

const Label = styled(Typography)(({ theme }) => ({
  display: "flex",
  flexGrow: 2,
  cursor: "pointer",
  padding: theme.spacing(0.75, 1.5),
})) as typeof Typography;

interface Props {
  id?: string;
  label: string;
  checked: boolean;
  onChange: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  inputProps?: React.InputHTMLAttributes<HTMLInputElement>;
  compact?: boolean;
}

export default function ChecklistItem({
  label,
  onChange,
  checked,
  id,
  inputProps,
  compact,
}: Props): FCReturn {
  return (
    <Root>
      <Checkbox
        checked={checked}
        id={id}
        onChange={onChange}
        inputProps={inputProps}
        compact={compact}
      />
      <Label variant="body1" className="label" component={"label"} htmlFor={id}>
        {label}
      </Label>
    </Root>
  );
}
