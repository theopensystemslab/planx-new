import MenuItem from "@mui/material/MenuItem";
import { flatFlags } from "@opensystemslab/planx-core/types";
import groupBy from "lodash/groupBy";
import React from "react";
import type { Props as SelectInputProps } from "ui/editor/SelectInput";
import SelectInput from "ui/editor/SelectInput";

const flags = groupBy(flatFlags, (f) => f.category);

const PermissionSelect: React.FC<SelectInputProps> = (props) => {
  // Material-ui doesn't like Fragments so this needs to be an array
  const flagMenuItems = Object.entries(flags).flatMap(
    ([category, categoryFlags]) => [
      <MenuItem disabled key={category}>
        {category}
      </MenuItem>,
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
    <SelectInput {...props}>
      {Boolean(props.value) && <MenuItem value="">Remove Flag</MenuItem>}
      {flagMenuItems}
    </SelectInput>
  );
};

export default PermissionSelect;
