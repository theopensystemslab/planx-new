import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import { Feature } from "geojson";
import React from "react";
import SelectInput from "ui/editor/SelectInput";
import InputLabel from "ui/public/InputLabel";

import { useMapAndLabelContext } from "./Context";

interface Props {
  index: number;
  features: Feature[];
}

export const CopyFeature: React.FC<Props> = ({ index: i, features }) => {
  const { schema } = useMapAndLabelContext();

  // Only show component if there are multiple features
  if (features.length < 2) return null;

  // We can only copy from other features
  const sourceFeatures = features.filter((_, j) => j !== i);

  return (
    <Box>
      <InputLabel label="Copy from" id={`select-${i}`}>
        <SelectInput
          bordered
          required
          title={"Copy from"}
          labelId={`select-label-${i}`}
          value={""}
          onChange={() => console.log(`TODO - Copy data from another tab`)}
          name={""}
          style={{ width: "200px" }}
        >
          {sourceFeatures.map((option) => (
            <MenuItem
              key={option.properties?.label}
              value={option.properties?.label}
            >
              {`${schema.type} ${option.properties?.label}`}
            </MenuItem>
          ))}
        </SelectInput>
      </InputLabel>
    </Box>
  );
};
