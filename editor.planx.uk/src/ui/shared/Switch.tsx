import Box from "@mui/material/Box";
import FormControlLabel from "@mui/material/FormControlLabel";
import MuiSwitch, { SwitchProps as MuiSwitchProps } from "@mui/material/Switch";
import React from "react";

interface Props {
  checked?: boolean;
  onChange: MuiSwitchProps["onChange"];
  label: Capitalize<string>
}

export const Switch: React.FC<Props> = ({ checked, onChange, label }) => (
  <Box>
    <FormControlLabel
      control={
        <MuiSwitch
          checked={checked}
          onChange={onChange}
        />
      }
      label={label}
    />
  </Box>
)