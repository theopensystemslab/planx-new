import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { ValueOptions } from "@mui/x-data-grid";
import React from "react";

import { False, True } from "./components/cellIcons";
import { CustomSingleSelectInput } from "./components/CustomSingleSelectInput";
import { ColumnRenderType, ColumnType } from "./types";

export const createFilterOperator = (columnValueOptions: ValueOptions[]) => ({
  value: "contains",
  getApplyFilterFn: (filterItem: Record<string, any>) => {
    if (!filterItem?.value) return null;

    return (value: string[]) => {
      return value?.some((item) =>
        String(item)
          .toLowerCase()
          .includes(String(filterItem.value).toLowerCase()),
      );
    };
  },
  InputComponent: CustomSingleSelectInput,
  InputComponentProps: {
    valueOptions: columnValueOptions,
  },
});

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
