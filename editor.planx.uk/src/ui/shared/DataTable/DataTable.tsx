import Box from "@mui/material/Box";
import { DataGrid, GridColDef } from "@mui/x-data-grid";
import React from "react";

interface DataGridProps {
  rows: readonly any[] | undefined;
  columns: readonly GridColDef<any>[];
}

export const DataTable = ({ rows, columns }: DataGridProps) => {
  const baseColDef: Partial<GridColDef> = {
    width: 150,
  };

  const dataColumns = columns.map((column) => ({
    ...baseColDef,
    ...column,
  }));

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
