/* eslint-disable no-restricted-imports */
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  GridColDef,
  GridValueOptionsParams,
  ValueOptions,
} from "@mui/x-data-grid";
import React from "react";

import { False, True } from "./components/cellIcons";
import { CustomSingleSelectInput } from "./components/CustomSingleSelectInput";
import {
  ColumnConfig,
  ColumnRenderType,
  ColumnType,
  DataGridProps,
  RenderCellParams,
} from "./types";

export const DataTable = <T,>({ rows, columns }: DataGridProps<T>) => {
  const baseColDef: Partial<GridColDef> = {
    width: 150,
  };

  const componentRegistry = {
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

  const getColumnType = (columnType?: ColumnRenderType) => {
    switch (columnType) {
      case ColumnType.BOOLEAN:
        return "boolean";
      case ColumnType.ARRAY:
        return "singleSelect";
      default:
        return undefined;
    }
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
      filterOperators: column.type === ColumnType.ARRAY &&
        columnValueOptions &&
        columnValueOptions.length > 0 && [
          {
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
          },
        ],
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
