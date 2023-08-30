import FormControlLabel, {
  FormControlLabelProps,
} from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import React from "react";

export interface Props {
  id: string;
  title: string;
  onChange: FormControlLabelProps["onChange"];
}

const BasicRadio: React.FC<Props> = ({ id, onChange, title }) => (
  <FormControlLabel
    value={id}
    onChange={onChange}
    control={<Radio />}
    label={title}
    sx={{ pb: 1 }}
  />
);

export default BasicRadio;
