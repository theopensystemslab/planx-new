/* eslint-disable no-restricted-imports */
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridColDef,
  GridValueOptionsParams,
  ValueOptions,
} from "@mui/x-data-grid";
import React from "react";

import {
  ColumnConfig,
  ColumnType,
  DataGridProps,
  RenderCellParams,
} from "./types";
import {
  componentRegistry,
  createFilterOperator,
  getColumnType,
} from "./utils";

export const DataTable = <T,>({ rows, columns }: DataGridProps<T>) => {
  const baseColDef: Partial<GridColDef> = {
    width: 150,
  };

  const renderCellComponentByType = (
    params: RenderCellParams,
    column: ColumnConfig<T>,
  ): JSX.Element | undefined => {
    if (!column.type) return undefined;
    if (column.customComponent) {
      return column.customComponent(params);
    }
    const ComponentRenderer = componentRegistry[column.type];
    return ComponentRenderer(params.value);
  };

  const dataColumns: GridColDef[] = columns.map((column, index) => {
    const getValueOptions = (
      options:
        | ValueOptions[]
        | ((params: GridValueOptionsParams<any>) => ValueOptions[]),
    ): ValueOptions[] | undefined => {
      if (Array.isArray(options)) {
        return options.filter((val) => val !== null);
      }
      return undefined;
    };

    const columnValueOptions =
      column.columnOptions?.valueOptions &&
      getValueOptions(column.columnOptions?.valueOptions);

    const { field, headerName } = column;
    return {
      ...baseColDef,
      hideable: index === 0 ? false : true, // at least one column should remain
      field: field as string,
      type: getColumnType(column.type),
      headerName,
      width: column.width || baseColDef.width,
      valueOptions:
        column.type === ColumnType.ARRAY ? columnValueOptions : undefined,
      filterOperators:
        column.type === ColumnType.ARRAY &&
        columnValueOptions &&
        columnValueOptions.length > 0 &&
        createFilterOperator(columnValueOptions),
      renderCell: column.type
        ? (params: RenderCellParams) =>
            renderCellComponentByType(params, column)
        : undefined,
      ...column.columnOptions,
    };
  }) as GridColDef[];

  return (
    <Box sx={{ height: "100vh", flex: 1, position: "relative" }}>
      <Box sx={{ inset: 0, position: "absolute" }}>
        <DataGrid
          rows={rows}
          columns={dataColumns}
          getRowHeight={() => "auto"}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
        />
      </Box>
    </Box>
  );
};
