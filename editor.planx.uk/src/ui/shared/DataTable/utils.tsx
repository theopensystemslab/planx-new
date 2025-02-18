import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ValueOptions } from "@mui/x-data-grid";
import React from "react";

import { False, True } from "./components/cellIcons";
import { CustomSingleSelectInput } from "./components/CustomSingleSelectInput";
import { ColumnRenderType, ColumnType } from "./types";

const isValidFilterInput = (filterItem: Record<string, any>): boolean => {
  return (
    Array.isArray(filterItem.value) &&
    filterItem.value.length === 2 &&
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

      const [firstValue, secondValue] = filterItem.value;

      return (value: string[]): boolean => {
        return value?.some(
          (item) =>
            containsItem(item, firstValue) ||
            value?.some((item) => containsItem(item, secondValue)),
        );
      };
    },
    InputComponent: CustomSingleSelectInput,
    InputComponentProps: {
      valueOptions: columnValueOptions,
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
