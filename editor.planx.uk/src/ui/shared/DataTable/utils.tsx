import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  getGridStringOperators,
  GridFilterItem,
  GridValueOptionsParams,
  ValueOptions,
} from "@mui/x-data-grid";
import { format } from "date-fns";
import capitalize from "lodash/capitalize";
import React from "react";

import { False, True } from "./components/cellIcons";
import { MultipleOptionSelectFilter } from "./components/MultipleOptionSelectFilter";
import { ColumnFilterType, ColumnRenderType } from "./types";

export const isValidFilterInput = (filterItem: GridFilterItem): boolean => {
  return (
    Array.isArray(filterItem.value) &&
    filterItem.value.length > 0 &&
    filterItem.value.every((val) => val != null)
  );
};

export const containsItem = (
  item: string,
  value: Pick<GridFilterItem, "value">,
): boolean => {
  if (typeof value === "string") {
    return item.toLowerCase().includes((value as string).toLowerCase());
  }
  return false;
};

export const createArrayFilterOperator = (
  columnValueOptions: ValueOptions[],
) => [
  {
    value: "is",
    getApplyFilterFn: (filterItem: GridFilterItem) => {
      if (!isValidFilterInput(filterItem)) {
        return null;
      }

      return (currentRowValue: string[]): boolean => {
        if (!currentRowValue?.length) return false;

        return currentRowValue.some((arrayItem) =>
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

export const defaultStringFilterOperator = getGridStringOperators().find(
  (op) => op.value === "contains",
);

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
  [ColumnFilterType.BOOLEAN]: (value: boolean) =>
    value ? <True /> : <False />,
  [ColumnFilterType.DATE]: () => undefined, // use default MUI data grid behaviour
  [ColumnFilterType.CUSTOM]: () => undefined,
  [ColumnFilterType.SINGLE_SELECT]: () => undefined,
  [ColumnFilterType.ARRAY]: (value: string[], filterValues?: string[]) => {
    return (
      <Box component="ol" padding={0} margin={0} sx={{ listStyleType: "none" }}>
        {value?.map((item: string, index: number) => (
          <Typography py={0.4} variant="body2" key={index} component="li">
            {filterValues?.includes(capitalize(item)) ? (
              <strong>{item}</strong>
            ) : (
              item
            )}
          </Typography>
        ))}
      </Box>
    );
  },
};

export const getColumnFilterType = (columnType?: ColumnRenderType) => {
  switch (columnType) {
    case ColumnFilterType.BOOLEAN:
      return "boolean";
    case ColumnFilterType.DATE:
      return "date";
    case ColumnFilterType.SINGLE_SELECT:
      return "singleSelect";
    case ColumnFilterType.CUSTOM:
    case ColumnFilterType.ARRAY:
      return undefined;
    default:
      return undefined;
  }
};

/**
 * Format date times to a standard format, e.g 31/12/25 14:40:45
 */
export const dateFormatter = (value: string) =>
  format(new Date(value), "dd/MM/yy HH:mm:ss");
