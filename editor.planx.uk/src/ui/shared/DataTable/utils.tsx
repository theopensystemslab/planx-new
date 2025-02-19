import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ValueOptions } from "@mui/x-data-grid";
import React from "react";

import { SelectMultiple2 } from "../SelectMultiple2";
import { False, True } from "./components/cellIcons";
import { ColumnRenderType, ColumnType } from "./types";

const isValidFilterInput = (filterItem: Record<string, any>): boolean => {
  return (
    Array.isArray(filterItem.value) &&
    filterItem.value.length > 0 &&
    filterItem.value.every((val) => val != null)
  );
};

const containsItem = (item: string, value: string) => {
  return item.toLowerCase().includes(value.toLowerCase());
};

export const createFilterOperator = (columnValueOptions: ValueOptions[]) => [
  {
    value: "contains",
    getApplyFilterFn: (filterItem: Record<string, any>) => {
      if (!isValidFilterInput(filterItem)) {
        return null;
      }

      return (value: string[]): boolean => {
        if (!value?.length) {
          return false;
        }

        return value.some((item) =>
          filterItem.value.some((filterValue: any) =>
            containsItem(item, filterValue),
          ),
        );
      };
    },
    InputComponent: SelectMultiple2,
    InputComponentProps: {
      options: columnValueOptions,
    },
  },
];

export const componentRegistry = {
  [ColumnType.BOOLEAN]: (value: boolean) => (value ? <True /> : <False />),
  [ColumnType.ARRAY]: (value: string[]) => (
    <Box component="ol" padding={0} margin={0} sx={{ listStyleType: "none" }}>
      {value?.map((item: string, index: number) => (
        <Typography py={0.4} variant="body2" key={index} component="li">
          {item}
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
