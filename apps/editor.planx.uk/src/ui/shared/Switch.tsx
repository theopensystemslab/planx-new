import Box from "@mui/material/Box";
import FormControlLabel, {
  formControlLabelClasses,
} from "@mui/material/FormControlLabel";
// eslint-disable-next-line no-restricted-imports
import MuiSwitch, { SwitchProps as MuiSwitchProps } from "@mui/material/Switch";
import React, { type ReactElement, type ReactNode } from "react";
import { FONT_WEIGHT_BOLD } from "theme";

import ErrorWrapper from "./ErrorWrapper";

interface Props {
  checked?: boolean;
  onChange: MuiSwitchProps["onChange"];
  label: ReactNode;
  name?: string;
  variant?: "editorPage" | "editorModal";
  capitalize?: boolean;
  disabled?: boolean;
  error?: string;
}

export const Switch: React.FC<Props> = ({
  checked,
  onChange,
  label,
  name,
  variant = "editorModal",
  capitalize = false,
  disabled,
  error,
}) => (
  <ErrorWrapper error={error}>
    <FormControlLabel
      control={
        <MuiSwitch
          checked={checked}
          onChange={onChange}
          sx={{ pointerEvents: "auto" }}
          disabled={disabled}
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
            textTransform: "",
            fontSize: 19,
          }),
          ...(capitalize && {
            textTransform: "capitalize",
          }),
        },
      }}
    />
  </ErrorWrapper>
);
