import MenuItem from "@material-ui/core/MenuItem";
import React from "react";
import SelectInput, { Props as SelectInputProps } from "ui/SelectInput";

import flags from "../../data/flags";

export const PermissionSelect: React.FC<SelectInputProps> = (props) => {
  // Material-ui doesn't like Fragments so this needs to be an array
  const flagMenuItems = Object.entries(flags).flatMap(([category, flags]) => [
    <MenuItem disabled key={category}>
      {category}
    </MenuItem>,
    Object.entries(flags).map(([id, flag]: [any, any]) => (
      <MenuItem
        key={id}
        value={id}
        style={{ borderLeft: `1em solid ${flag.bgColor || "transparent"}` }}
      >
        {flag.text}
      </MenuItem>
    )),
  ]);

  return (
    <SelectInput {...props}>
      {props.value && <MenuItem value="">Remove Flag</MenuItem>}
      {flagMenuItems}
    </SelectInput>
  );
};
