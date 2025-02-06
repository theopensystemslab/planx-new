import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import { capitalize, get } from "lodash";
import React from "react";
import ChecklistItem from "ui/shared/ChecklistItem/ChecklistItem";

import Filters, { FilterKey, FilterValues } from "./Filter";

const Column = styled(Box)(() => ({
  flexBasis: "20%",
}));

interface FiltersColumnProps<T> {
  title: string;
  optionKey: FilterKey<T>;
  optionValues: FilterValues[];
  filters?: Filters<T> | null;
  handleChange: (key: FilterKey<T>, value: FilterValues) => void;
}

export const FiltersColumn = <T extends object>(
  props: FiltersColumnProps<T>,
) => {
  return (
    <Column>
      <Typography component={"legend"} variant="h5" pb={0.5}>
        {props.title}
      </Typography>
      {props.optionValues.map((value) => (
        <ChecklistItem
          key={`${props.optionKey.toString()}-${value}-checkbox`}
          onChange={() => props.handleChange(props.optionKey, value)}
          label={capitalize(`${value}`)}
          id={`${props.optionKey.toString()}-${value}-checkbox`}
          checked={get(props.filters, props.optionKey) === value}
          variant="compact"
        />
      ))}
    </Column>
  );
};
