import { FormControlLabelProps } from "@material-ui/core";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import React from "react";

export interface Props {
  id: string;
  title: string;
  onChange: FormControlLabelProps["onChange"];
}

const DecisionRadio: React.FC<Props> = ({ id, onChange, title }) => (
  <FormControlLabel
    value={id}
    onChange={onChange}
    control={<Radio />}
    label={title}
  />
);

export default DecisionRadio;
