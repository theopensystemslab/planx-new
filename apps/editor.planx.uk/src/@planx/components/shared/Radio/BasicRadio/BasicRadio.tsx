import Box from "@mui/material/Box";
import FormControlLabel, {
  FormControlLabelProps,
} from "@mui/material/FormControlLabel";
import { formControlLabelClasses } from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import React from "react";

export interface Props {
  id?: string | boolean;
  label: FormControlLabelProps["label"];
  description?: string;
  onChange: FormControlLabelProps["onChange"];
  variant?: "default" | "compact";
  value?: string;
  disabled?: boolean;
}

const BasicRadio: React.FC<Props> = ({
  id,
  onChange,
  label,
  description,
  variant = "default",
  disabled,
}) => (
  <FormControlLabel
    value={id}
    onChange={onChange}
    control={<Radio variant={variant} />}
    label={
      description ? (
        <Box>
          <Box sx={{ fontWeight: "bold", mb: 1 }}>{label}</Box>
          <Box sx={{ color: "text.secondary" }}>{description}</Box>
        </Box>
      ) : (
        label
      )
    }
    disabled={disabled}
    sx={(theme) => ({
      ml: theme.spacing(-1),
      mb: variant === "default" ? 1 : 0,
      alignItems: "flex-start",
      [`& .${formControlLabelClasses.label}`]: {
        paddingTop: theme.spacing(0.95),
      },
    })}
  />
);

export default BasicRadio;
