import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";

import { False, True } from "./components/icons";
import {
  ColumnConfig,
  ColumnType,
  DataGridProps,
  RenderCellParams,
} from "./types";

export const DataTable = ({ rows, columns }: DataGridProps) => {
  const baseColDef: Partial<GridColDef> = {
    width: 150,
  };

  const componentRegistry = {
    [ColumnType.BOOLEAN]: (value: boolean) => (value ? <True /> : <False />),
    [ColumnType.ARRAY]: (value: string[]) => (
      <Box component="ol" padding={0} margin={0} sx={{ listStyleType: "none" }}>
        {value.map((item: string, index: number) => (
          <Typography py={0.4} variant="body2" key={index} component="li">
            {item}
          </Typography>
        ))}
      </Box>
    ),
  };

  const renderCellComponentByType = (
    params: RenderCellParams,
    column: ColumnConfig,
  ): JSX.Element | undefined => {
    if (!column.type) return undefined;
    if (column.customComponent) {
      return column.customComponent(params);
    }
    const ComponentRenderer = componentRegistry[column.type];
    return ComponentRenderer(params.value);
  };

  const dataColumns: GridColDef[] = columns.map((column, index) => {
    const { field, headerName } = column;
    return {
      ...baseColDef,
      hideable: index === 0 ? false : true, // at least one column should remain
      field,
      type: column.type === ColumnType.BOOLEAN ? "boolean" : undefined,
      headerName,
      width: column.width || baseColDef.width,
      renderCell: column.type
        ? (params: RenderCellParams) =>
            renderCellComponentByType(params, column)
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
