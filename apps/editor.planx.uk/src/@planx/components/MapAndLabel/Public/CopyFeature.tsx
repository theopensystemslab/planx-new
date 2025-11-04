import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import MenuItem from "@mui/material/MenuItem";
import { visuallyHidden } from "@mui/utils";
import { useFormik } from "formik";
import { Feature } from "geojson";
import React from "react";
import InputLabel from "ui/public/InputLabel";
import SelectInput from "ui/shared/SelectInput/SelectInput";

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

  const formik = useFormik({
    initialValues: {
      sourceLabel: sourceFeatures[0]?.properties?.label,
    },
    onSubmit: ({ sourceLabel }) => copyFeature(sourceLabel, destinationIndex),
  });

  return (
    <Box
      sx={{ display: "flex" }}
      component={"form"}
      onSubmit={formik.handleSubmit}
    >
      <Box>
        <InputLabel label="Copy from" id={`select-${destinationIndex}-label`}>
          <SelectInput
            disabled={isDisabled}
            name={`select-${destinationIndex}`}
            size="small"
            aria-describedby="copy-feature-description"
            bordered
            required
            title={"Copy from"}
            value={formik.values.sourceLabel}
            onChange={(e) =>
              formik.setFieldValue("sourceLabel", e.target.value)
            }
          >
            <span id="copy-feature-description" style={visuallyHidden}>
              Please add at least two features to the map in order to enable
              this feature
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
      <Button
        data-testid="copyButton"
        type="submit"
        disableRipple
        sx={{ alignSelf: "flex-end", ml: 2, mb: 0.5 }}
        disabled={isDisabled}
      >
        Copy
      </Button>
    </Box>
  );
};
