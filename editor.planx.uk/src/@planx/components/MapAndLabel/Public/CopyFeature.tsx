import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import { Feature } from "geojson";
import React from "react";
import SelectInput from "ui/editor/SelectInput";
import InputLabel from "ui/public/InputLabel";

import { useMapAndLabelContext } from "./Context";

interface Props {
  destinationIndex: number;
  features: Feature[];
}

export const CopyFeature: React.FC<Props> = ({
  destinationIndex,
  features,
}) => {
  const { schema, copyFeature } = useMapAndLabelContext();

  // Only show component if there are multiple features
  if (features.length < 2) return null;

  // We can only copy from other features
  const sourceFeatures = features.filter(
    (_, sourceIndex) => sourceIndex !== destinationIndex,
  );

  return (
    <Box>
      <InputLabel label="Copy from" id={`select-${destinationIndex}`}>
        <SelectInput
          bordered
          required
          title={"Copy from"}
          labelId={`select-label-${destinationIndex}`}
          value={""}
          onChange={(e) => {
            const label = e.target.value as string;
            // Convert text label to zero-indexed integer
            const sourceIndex = parseInt(label, 10) - 1;
            copyFeature(sourceIndex, destinationIndex);
          }}
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
