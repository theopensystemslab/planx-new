import FormControlLabel, {
  FormControlLabelProps,
} from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import React from "react";

export interface Props {
  id: string;
  title: string;
  onChange: FormControlLabelProps["onChange"];
  variant?: "default" | "compact";
  value?: string;
}

const BasicRadio: React.FC<Props> = ({
  id,
  onChange,
  title,
  variant = "default",
}) => (
  <FormControlLabel
    value={id}
    onChange={onChange}
    control={<Radio variant={variant} />}
    label={title}
    sx={variant === "default" ? { pb: 1 } : {}}
  />
);

export default BasicRadio;
