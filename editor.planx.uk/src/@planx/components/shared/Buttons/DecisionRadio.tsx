import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import React from "react";

export interface RadioProps {
  id?: string;
  responseKey?: string | number;
  title: string;
  description?: string;
  onChange:
    | ((event: React.SyntheticEvent<Element, Event>, checked: boolean) => void)
    | undefined;
}

const DecisionRadio: React.FC<RadioProps> = ({
  responseKey,
  title,
  ...props
}) => {
  return (
    <FormControlLabel
      value={props.id}
      onChange={props.onChange}
      control={<Radio />}
      label={title}
    />
  );
};

export default DecisionRadio;
