import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import { visuallyHidden } from "@mui/utils";
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

  // Only enable component if there are multiple features
  const isDisabled = features.length < 2;

  // We can only copy from other features
  const sourceFeatures = features.filter(
    (_, sourceIndex) => sourceIndex !== destinationIndex,
  );

  return (
    <Box>
      <InputLabel label="Copy from" id={`select-${destinationIndex}`}>
        <SelectInput
          disabled={isDisabled}
          aria-describedby="copy-feature-description"
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
          name={"copyFeature"}
          style={{ width: "200px" }}
        >
          <span id="copy-feature-description" style={visuallyHidden}>
            Please add at least two features to the map in order to enable this
            feature
          </span>
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
