import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import {
  DataGrid,
  GridColDef,
  GridRenderCellParams,
  GridTreeNodeWithRender,
} from "@mui/x-data-grid";
import React from "react";

import { Configured, NotConfigured } from "./icons";

export const ColumnType = {
  BOOLEAN: "boolean",
  ARRAY: "array",
  CUSTOM: "custom",
} as const;

type ObjectValues<T> = T[keyof T];

type RenderCellParams = GridRenderCellParams<
  any,
  any,
  any,
  GridTreeNodeWithRender
>;

export type ColumnRenderType = ObjectValues<typeof ColumnType>;

export type ColumnConfig = {
  field: string;
  headerName: string;
  type?: ColumnRenderType;
  width?: number;
  customComponent?:
    | ((params: RenderCellParams) => JSX.Element | undefined)
    | undefined;
};

interface DataGridProps {
  rows: readonly any[] | undefined;
  columns: Array<ColumnConfig>;
}

export const DataTable = ({ rows, columns }: DataGridProps) => {
  const baseColDef: Partial<GridColDef> = {
    width: 150,
  };

  const componentRegistry = {
    [ColumnType.BOOLEAN]: (params: RenderCellParams) =>
      params.value ? <Configured /> : <NotConfigured />,
    [ColumnType.ARRAY]: (params: RenderCellParams) => (
      <Box component="ol" padding={0} margin={0} sx={{ listStyleType: "none" }}>
        {params.value.map((item: string, index: number) => (
          <Typography py={0.4} variant="body2" key={index} component="li">
            {item}
          </Typography>
        ))}
      </Box>
    ),
    [ColumnType.CUSTOM]: (params: RenderCellParams, column: ColumnConfig) => {
      if (!column.customComponent) return undefined;
      return column.customComponent(params);
    },
  };

  const renderCell2 = (
    params: RenderCellParams,
    column: ColumnConfig,
  ): JSX.Element | undefined => {
    if (!column.type) return undefined;
    const ComponentRenderer = componentRegistry[column.type];
    return ComponentRenderer(params, column);
  };

  const dataColumns = columns.map((column) => {
    const { field, headerName, type } = column;
    return {
      ...baseColDef,
      field,
      headerName,
      width: column.width || baseColDef.width,
      renderCell: type
        ? (params: RenderCellParams) => renderCell2(params, column)
        : undefined,
    };
  });

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
