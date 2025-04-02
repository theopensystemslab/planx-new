import Box from "@mui/material/Box";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import { visuallyHidden } from "@mui/utils";
import { capitalize, get } from "lodash";
import React from "react";

import SelectInput from "../SelectInput/SelectInput";
import Filters, { FilterKey, FilterValues } from "./Filter";
import { StyledChip } from "./FilterStyles";

interface FiltersColumnProps<T> {
  title: string;
  optionKey: FilterKey<T>;
  optionValues: FilterValues[];
  filters?: Filters<T> | null;
  handleChange: (key: FilterKey<T>, value: FilterValues | "") => void;
}

export const FiltersColumn = <T extends object>(
  props: FiltersColumnProps<T>,
) => {
  const selectedValue = get(props.filters, props.optionKey) || "";

  return (
    <Box>
      <Typography
        component={"legend"}
        variant="h5"
        pb={0.5}
        style={visuallyHidden}
      >
        {props.title}
      </Typography>
      {selectedValue ? (
        <StyledChip
          label={capitalize(`${selectedValue}`)}
          onDelete={() => props.handleChange(props.optionKey, "")}
        />
      ) : (
        <SelectInput
          value={selectedValue}
          onChange={(event) =>
            props.handleChange(
              props.optionKey,
              event.target.value as FilterValues,
            )
          }
          fullWidth
          displayEmpty
          sx={{ height: 40, maxWidth: "200px" }}
        >
          <MenuItem value="" disabled>
            {props.title}
          </MenuItem>
          {props.optionValues.map((value) => (
            <MenuItem
              key={`${props.optionKey.toString()}-${value}`}
              value={value}
            >
              {capitalize(`${value}`)}
            </MenuItem>
          ))}
        </SelectInput>
      )}
    </Box>
  );
};
