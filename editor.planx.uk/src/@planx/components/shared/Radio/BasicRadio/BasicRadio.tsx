import FormControlLabel, {
  FormControlLabelProps,
} from "@mui/material/FormControlLabel";
import { formControlLabelClasses } from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import React from "react";

export interface Props {
  id?: string;
  title: string;
  onChange: FormControlLabelProps["onChange"];
  variant?: "default" | "compact";
  value?: string;
  disabled?: boolean;
}

const BasicRadio: React.FC<Props> = ({
  id,
  onChange,
  title,
  variant = "default",
  disabled,
}) => (
  <FormControlLabel
    value={id}
    onChange={onChange}
    control={<Radio variant={variant} />}
    label={title}
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
