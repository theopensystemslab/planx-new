import Box from "@mui/material/Box";
import FormControlLabel, { FormControlLabelProps } from "@mui/material/FormControlLabel";
// eslint-disable-next-line no-restricted-imports
import MuiSwitch, { SwitchProps as MuiSwitchProps } from "@mui/material/Switch";
import React from "react";

interface Props {
  checked?: boolean;
  onChange: MuiSwitchProps["onChange"];
  label: Capitalize<string>
  formControlLabelProps?: Partial<FormControlLabelProps>;
}

export const Switch: React.FC<Props> = ({ checked, onChange, label, formControlLabelProps }) => (
  <Box>
    <FormControlLabel
      control={
        <MuiSwitch
          checked={checked}
          onChange={onChange}
        />
      }
      label={label}
      {...formControlLabelProps}
    />
  </Box>
)