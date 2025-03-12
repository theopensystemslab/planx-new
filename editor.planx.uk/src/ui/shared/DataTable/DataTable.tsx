/* eslint-disable no-restricted-imports */
import Box from "@mui/material/Box";
import {
  DataGrid,
  GridColDef,
  GridFilterModel,
  GridToolbarColumnsButton,
  GridToolbarContainer,
  GridToolbarDensitySelector,
  GridToolbarExport,
  GridToolbarFilterButton,
} from "@mui/x-data-grid";
import React, { useState } from "react";

import {
  ColumnConfig,
  ColumnFilterType,
  DataGridProps,
  RenderCellParams,
} from "./types";
import {
  columnCellComponentRegistry,
  createFilterOperator,
  getColumnFilterType,
  getValueOptions,
} from "./utils";

export const DataTable = <T,>({
  rows,
  columns,
  csvExportFileName,
}: DataGridProps<T>) => {
  const renderCellComponentByType = (
    params: RenderCellParams,
    column: ColumnConfig<T>,
    filterValues?: string[],
  ): JSX.Element | undefined => {
    if (!column.type) return undefined;
    if (column.customComponent) {
      return column.customComponent(params);
    }
    const ComponentRenderer = columnCellComponentRegistry[column.type];
    return ComponentRenderer(params.value, filterValues);
  };

  const CustomToolbar = () => {
    return (
      <GridToolbarContainer>
        <GridToolbarColumnsButton />
        <GridToolbarFilterButton />
        <GridToolbarDensitySelector />
        <GridToolbarExport
          csvOptions={{
            fileName: csvExportFileName,
          }}
        />
      </GridToolbarContainer>
    );
  };

  const [filterValues, setFilterValues] = useState<string[]>([]);

  const dataColumns: GridColDef[] = columns.map((column, index) => {
    const columnValueOptions =
      column.columnOptions?.valueOptions &&
      getValueOptions(column.columnOptions?.valueOptions);

    const { field, headerName } = column;

    const baseColDef: Partial<GridColDef> = {
      width: column.width || 150,
      hideable: index === 0 ? false : true, // at least one column should remain
      field: field as string,
      type: getColumnFilterType(column.type),
      headerName,
      renderCell: column.type
        ? (params: RenderCellParams) =>
            renderCellComponentByType(params, column, filterValues)
        : undefined,
    };

    return column.type === ColumnFilterType.ARRAY
      ? {
          ...baseColDef,
          valueOptions: columnValueOptions,
          ...column.columnOptions,
          filterOperators:
            columnValueOptions &&
            columnValueOptions.length > 0 &&
            createFilterOperator(columnValueOptions),
        }
      : {
          ...baseColDef,
          valueOptions: undefined,
          ...column.columnOptions,
        };
  }) as GridColDef[];

  const handleFilterChange = (model: GridFilterModel) => {
    const item = model.items[0];
    if (!item || !item.value) {
      setFilterValues([]);
      return;
    }

    // Only set filterValues for ARRAY columns
    const column = columns.find((col) => col.field === item.field);
    if (column?.type === ColumnFilterType.ARRAY) {
      setFilterValues(
        Array.isArray(item.value) ? item.value : [String(item.value)],
      );
    } else {
      setFilterValues([]);
    }
  };

  return (
    <Box sx={{ mt: 1, height: "100%", position: "relative" }}>
      <Box sx={{ inset: 0, position: "absolute" }}>
        <DataGrid
          rows={rows}
          columns={dataColumns}
          onFilterModelChange={handleFilterChange}
          getRowHeight={() => "auto"}
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? "even" : "odd"
          }
          slots={{
            toolbar: CustomToolbar,
          }}
        />
      </Box>
    </Box>
  );
};
