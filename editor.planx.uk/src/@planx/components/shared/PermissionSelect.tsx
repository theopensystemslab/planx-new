import MenuItem from "@mui/material/MenuItem";
import flags from "pages/FlowEditor/data/flags";
import React from "react";
import type { Props as SelectInputProps } from "ui/SelectInput";
import SelectInput from "ui/SelectInput";

const PermissionSelect: React.FC<SelectInputProps> = (props) => {
  // Material-ui doesn't like Fragments so this needs to be an array
  const flagMenuItems = Object.entries(flags).flatMap(([category, flags]) => [
    <MenuItem disabled key={category}>
      {category}
    </MenuItem>,
    Object.entries(flags).map(([id, flag]: [any, any]) => (
      <MenuItem
        key={id}
        value={id}
        style={{
          borderLeft: `1em solid ${flag.bgColor || "transparent"}`,
          fontSize: "1rem",
        }}
      >
        {flag.text}
      </MenuItem>
    )),
  ]);

  return (
    <SelectInput {...props}>
      {Boolean(props.value) && <MenuItem value="">Remove Flag</MenuItem>}
      {flagMenuItems}
    </SelectInput>
  );
};

export default PermissionSelect;
