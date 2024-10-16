import { fallbackHttpConfig } from "@apollo/client";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Select, { SelectChangeEvent } from "@mui/material/Select";
import { Flag, flatFlags } from "@opensystemslab/planx-core/types";
import groupBy from "lodash/groupBy";
import React from "react";
import type { Props as SelectInputProps } from "ui/editor/SelectInput";
import SelectInput from "ui/editor/SelectInput";
import { SelectMultiple } from "ui/shared/SelectMultiple";

const flags = groupBy(flatFlags, (f) => f.category);

const FlagsSelect: React.FC<SelectInputProps> = (props) => {
  const initialFlagValues = props?.value ? [props.value as string] : [];
  const [flagValue, setFlagValue] = React.useState<string[]>(initialFlagValues);

  const handleChange = (event: SelectChangeEvent<typeof flagValue>) => {
    const {
      target: { value },
    } = event;
    setFlagValue(
      // On autofill we get a stringified value.
      typeof value === 'string' ? value.split(',') : value,
    );
  };

  const flagMenuItems = Object.entries(flags).flatMap(
    ([category, categoryFlags]) => [
      <ListSubheader key={category}>
        {category}
      </ListSubheader>,
      categoryFlags.map((flag) => (
        <MenuItem
          key={flag.value}
          value={flag.value}
          style={{
            borderLeft: `1em solid ${flag.bgColor || "transparent"}`,
            fontSize: "1rem",
          }}
        >
          {flag.text}
        </MenuItem>
      )),
    ],
  );

  return (
    <FormControl>
        <InputLabel htmlFor="grouped-select">Flags</InputLabel>
        <Select 
          id="grouped-select" 
          label="Flags"
          multiple
          value={flagValue}
          onChange={handleChange}
          // defaultValue=""
        >
          <MenuItem value="">
            {"None"}
          </MenuItem>
          {flagMenuItems}
        </Select>
      </FormControl>
  );
};

export default FlagsSelect;
