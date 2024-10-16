import { fallbackHttpConfig } from "@apollo/client";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import ListSubheader from "@mui/material/ListSubheader";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { Flag, flatFlags } from "@opensystemslab/planx-core/types";
import groupBy from "lodash/groupBy";
import React from "react";
import type { Props as SelectInputProps } from "ui/editor/SelectInput";
import SelectInput from "ui/editor/SelectInput";
import { SelectMultiple } from "ui/shared/SelectMultiple";

const flags = groupBy(flatFlags, (f) => f.category);

const FlagsSelect: React.FC<SelectInputProps> = (props) => {
  // Material-ui doesn't like Fragments so this needs to be an array
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
    // <SelectInput {...props}>
    //   {Boolean(props.value) && <MenuItem value="">Remove Flag</MenuItem>}
    //   {flagMenuItems}
    // </SelectInput>
    // <SelectMultiple 
    //   key={`select-multiple-flags`}
    //   id={`select-multiple-flags`}
    //   label="Flags (select up to one per category)"
    //   options={flatFlags}
    //   getOptionLabel={(flag) => flag.text}
    //   groupBy={(flag) => flag.category}
    //   sx={props.sx}
    // />
    <FormControl>
        <InputLabel htmlFor="grouped-select">Flags</InputLabel>
        <Select defaultValue="" id="grouped-select" label="Flags">
          <MenuItem value="">
            {"None"}
          </MenuItem>
          {flagMenuItems}
        </Select>
      </FormControl>
  );
};

export default FlagsSelect;
