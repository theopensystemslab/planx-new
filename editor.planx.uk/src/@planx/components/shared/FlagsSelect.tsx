import { AutocompleteProps } from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import ListItem from "@mui/material/ListItem";
import { Flag, flatFlags } from "@opensystemslab/planx-core/types";
import React from "react";
import InputRow from "ui/shared/InputRow";
import { CustomCheckbox, SelectMultiple } from "ui/shared/SelectMultiple";

interface Props {
  value?: string[];
  onChange: (values: string[]) => void;
}

const renderOptions: AutocompleteProps<
  Flag,
  true,
  true,
  false,
  "div"
>["renderOption"] = (props, flag, { selected }) => (
  <ListItem {...props}>
    <CustomCheckbox aria-hidden="true" className={selected ? "selected" : ""} sx={{ backgroundColor: `${flag.bgColor}` }} />
    {flag.text}
  </ListItem>
);

const renderTags: AutocompleteProps<
  Flag,
  true,
  true,
  false,
  "div"
>["renderTags"] = (value, getFlagProps) =>
  value.map((flag, index) => (
    <Chip
      {...getFlagProps({ index })}
      key={flag.value}
      label={flag.text}
      sx={{ backgroundColor: flag.bgColor, color: flag.color }}
    />
  ));

export const FlagsSelect: React.FC<Props> = ({ value, onChange }) => {
  return (
    <InputRow>
      <SelectMultiple 
        label="Flags"
        options={flatFlags}
        getOptionLabel={(flag) => flag.text}
        groupBy={(flag) => flag.category}
        onChange={(_e, value) => onChange(value)}
        value={value}
        renderOption={renderOptions}
        renderTags={renderTags}
      />
    </InputRow>
  );
};
