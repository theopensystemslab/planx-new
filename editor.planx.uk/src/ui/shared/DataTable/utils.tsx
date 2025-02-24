import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  GridFilterItem,
  GridValueOptionsParams,
  ValueOptions,
} from "@mui/x-data-grid";
import React from "react";

import { False, True } from "./components/cellIcons";
import { MultipleOptionSelectFilter } from "./components/MultipleOptionSelectFilter";
import { ColumnRenderType, ColumnType } from "./types";

const isValidFilterInput = (filterItem: GridFilterItem): boolean => {
  return (
    Array.isArray(filterItem.value) &&
    filterItem.value.length > 0 &&
    filterItem.value.every((val) => val != null)
  );
};

const containsItem = (item: string, value: Pick<GridFilterItem, "value">) => {
  if (typeof value === "string") {
    return item.toLowerCase().includes((value as string).toLowerCase());
  }
};

export const createFilterOperator = (columnValueOptions: ValueOptions[]) => [
  {
    value: "contains",
    getApplyFilterFn: (filterItem: GridFilterItem) => {
      if (!isValidFilterInput(filterItem)) {
        return null;
      }

      return (arrayOfValues: string[]): boolean => {
        if (!arrayOfValues?.length) {
          return false;
        }

        return arrayOfValues.some((arrayItem) =>
          filterItem.value.some((filterValue: Pick<GridFilterItem, "value">) =>
            containsItem(arrayItem, filterValue),
          ),
        );
      };
    },
    InputComponent: MultipleOptionSelectFilter,
    InputComponentProps: {
      options: columnValueOptions,
    },
  },
];

export const getValueOptions = (
  options:
    | ValueOptions[]
    | ((params: GridValueOptionsParams<any>) => ValueOptions[]),
): ValueOptions[] | undefined => {
  if (Array.isArray(options)) {
    return options.filter((val) => val !== null);
  }
  return undefined;
};

export const columnCellComponentRegistry = {
  [ColumnType.BOOLEAN]: (value: boolean) => (value ? <True /> : <False />),
  [ColumnType.ARRAY]: (value: string[], filterValues?: string[]) => (
    <Box component="ol" padding={0} margin={0} sx={{ listStyleType: "none" }}>
      {value?.map((item: string, index: number) => (
        <Typography py={0.4} variant="body2" key={index} component="li">
          {filterValues?.includes(item) ? <strong>{item}</strong> : item}
        </Typography>
      ))}
    </Box>
  ),
};

export const getColumnType = (columnType?: ColumnRenderType) => {
  switch (columnType) {
    case ColumnType.BOOLEAN:
      return "boolean";
    case ColumnType.ARRAY:
      return "singleSelect";
    default:
      return undefined;
  }
};
