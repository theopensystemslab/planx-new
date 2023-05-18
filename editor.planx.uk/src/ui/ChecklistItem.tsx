import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import * as React from "react";

import Checkbox from "./Checkbox";

const Root = styled(Box)(({ theme }) => ({
  width: "100%",
  cursor: "pointer",
  marginBottom: theme.spacing(1.5),
  paddingRight: theme.spacing(1),
  display: "inline-flex",
  alignItems: "center",
}));

const Label = styled(Typography)(({ theme }) => ({
  marginLeft: theme.spacing(1.5),
  "& > label": {
    cursor: "pointer",
  },
}));

interface Props {
  id?: string;
  label: string;
  checked: boolean;
  onChange: (event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
}

export default function ChecklistItem({
  label,
  onChange,
  checked,
  id,
}: Props): FCReturn {
  return (
    <Root>
      <Checkbox checked={checked} id={id} onChange={onChange} />
      <Label variant="body2">
        <label htmlFor={id}>{label}</label>
      </Label>
    </Root>
  );
}
