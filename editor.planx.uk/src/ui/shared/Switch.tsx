import Box from "@mui/material/Box";
import FormControlLabel, { formControlLabelClasses } from "@mui/material/FormControlLabel";
// eslint-disable-next-line no-restricted-imports
import MuiSwitch, { SwitchProps as MuiSwitchProps } from "@mui/material/Switch";
import React from "react";
import { FONT_WEIGHT_BOLD } from "theme";

interface Props {
  checked?: boolean;
  onChange: MuiSwitchProps["onChange"];
  label: Capitalize<string>
  name?: string;
  variant?: "editorPage" | "editorModal"
}

export const Switch: React.FC<Props> = ({ checked, onChange, label, name, variant = "editorModal" }) => (
  <Box>
    <FormControlLabel
      control={
        <MuiSwitch
          checked={checked}
          onChange={onChange}
          sx={{ pointerEvents: "auto"}}
          />
        }
      name={name}
      label={label}
      sx={{ 
        pointerEvents: "none", 
        [`& .${formControlLabelClasses.label}`]: { 
          pointerEvents: "auto", 
          display: "contents",
          ...(variant === "editorPage" && {
            fontWeight: FONT_WEIGHT_BOLD,
            textTransform: "capitalize",
            fontSize: 19,
          })
        }
      }}
    />
  </Box>
)
